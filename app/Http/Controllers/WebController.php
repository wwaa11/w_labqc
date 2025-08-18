<?php
namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetType;
use App\Models\Control;
use App\Models\ControlType;
use App\Models\LimitValue;
use App\Models\Record;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WebController extends Controller
{
    // Non-admin: View assets at the current user's location
    public function UserAssets(Request $request)
    {
        $userLocation = auth()->user()->location;

        if (auth()->user()->role == 'admin' || auth()->user()->role == 'superadmin') {
            $userLocation = 'all';
        }

        $assets     = $this->getUserAssets($userLocation);
        $assetDatas = $this->buildAssetData($assets);

        return inertia('users/dashboard', [
            'assets' => $assetDatas,
        ]);
    }

    /**
     * Get assets for the user's location
     */
    private function getUserAssets(string $userLocation)
    {
        if ($userLocation == 'all') {
            return Asset::query()
                ->where('is_deleted', false)
                ->get();
        }

        return Asset::query()
            ->where('location', $userLocation)
            ->where('is_deleted', false)
            ->get();
    }

    /**
     * Build asset data with controls and records
     */
    private function buildAssetData($assets)
    {
        return $assets->map(function ($asset) {
            return [
                'id'            => $asset->id,
                'name'          => $asset->name,
                'location'      => $asset->location,
                'brand'         => $asset->brand,
                'model'         => $asset->model,
                'serial_number' => $asset->serial_number,
                'frequency'     => $asset->frequency,
                'environment'   => $asset->environment,
                'controls'      => $this->getAssetControls($asset),
            ];
        })->toArray();
    }

    /**
     * Get controls for a specific asset
     */
    private function getAssetControls($asset)
    {
        $controlTypes = ControlType::where('asset_type_id', $asset->asset_type_id)
            ->where('is_deleted', false)
            ->get();

        return $controlTypes->map(function ($controlType) use ($asset) {
            $activeControl = $this->getActiveControl($controlType->id);

            if (! $activeControl) {
                return null;
            }

            return [
                'type'            => $controlType->control_type_name,
                'control_type_id' => $controlType->id,
                'control_name'    => $activeControl->control_name,
                'brand'           => $activeControl->brand,
                'lot'             => $activeControl->lot,
                'expired'         => $activeControl->expired,
                'limit_type'      => $activeControl->limit_type,
                'limit_value'     => $this->getLimitValue($activeControl),
                'limit_options'   => $this->getLimitOptions($activeControl),
                'last_record'     => $this->getLastRecord($asset->id, $controlType->id),
            ];
        })->filter()->values()->toArray();
    }

    /**
     * Get active control for a control type
     */
    private function getActiveControl(int $controlTypeId)
    {
        return Control::where('control_type_id', $controlTypeId)
            ->where('is_deleted', false)
            ->where('is_active', true)
            ->first();
    }

    /**
     * Get limit value based on control type
     */
    private function getLimitValue($control)
    {
        $limitValue = LimitValue::where('control_id', $control->id)->where('is_deleted', false)->first();

        if (! $limitValue) {
            return null;
        }

        switch ($control->limit_type) {
            case 'range':
                return $limitValue->min_value . ' - ' . $limitValue->max_value;
            case 'text':
                return $limitValue->text_value;
            default:
                return null;
        }
    }

    /**
     * Get limit options for option type controls
     */
    private function getLimitOptions($control)
    {
        if ($control->limit_type !== 'option') {
            return [];
        }

        return LimitValue::where('control_id', $control->id)
            ->where('is_deleted', false)
            ->pluck('option_value')
            ->toArray();
    }

    /**
     * Get the last approved record for an asset and control type
     */
    private function getLastRecord(int $assetId, int $controlTypeId)
    {
        return Record::where('asset_id', $assetId)
            ->where('control_type_id', $controlTypeId)
            ->where('is_deleted', false)
            ->whereNotNull('approved_by')
            ->latest()
            ->first();
    }

    // Create a record for a control type, validating against the active control's limits
    public function RecordsStore(Request $request)
    {
        $validated = $request->validate([
            'asset_id'        => 'required|exists:assets,id',
            'control_type_id' => 'required|exists:control_types,id',
            'record_value'    => 'required|string|max:1000',
            'memo'            => 'nullable|string|max:1000',
        ]);

        $controlType = ControlType::findOrFail($validated['control_type_id']);
        // Use the active control for this control type
        $control = Control::where('control_type_id', $controlType->id)->where('is_active', true)->with(['limitValues' => function ($q) {
            $q->where('is_deleted', false);
        }])->first();
        if (! $control) {
            return back()->with('error', 'No active control for this control type.');
        }
        $value = $validated['record_value'];

        $result = null;
        if ($control->limit_type == 'range') {
            $lv       = $control->limitValues;
            $minValue = $lv?->min_value;
            $maxValue = $lv?->max_value;
            if ($minValue !== null && $maxValue !== null && $value >= $minValue && $value <= $maxValue) {
                $result = 'PASS';
            } else {
                $result = 'FAIL';
            }
        }

        $record                  = new \App\Models\Record();
        $record->asset_id        = $validated['asset_id'];
        $record->control_type_id = $controlType->id;
        $record->record_value    = $value;
        $record->record_result   = $result;
        $record->verified_by     = auth()->user() ? (auth()->user()->user_id ?? auth()->user()->name ?? null) : null;
        $record->approved_by     = null;
        $record->memo            = $validated['memo'] ?? null;
        $record->is_deleted      = false;
        $record->save();

        return back()->with('success', 'Record created successfully.');
    }

    public function RolesMain(Request $request)
    {
        $query = User::query();
        if ($request->filled('search')) {
            $query->where('user_id', 'like', '%' . $request->search . '%');
        }
        $users        = $query->get();
        $getlocations = Asset::groupBy('location')->select('location')->get();
        $locations    = [];
        foreach ($getlocations as $location) {
            $locations[] = $location->location;
        }

        return inertia('roles/main', [
            'users'     => $users,
            'locations' => $locations,
            'auth'      => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function CreateRoleData($userid)
    {
        $response = Http::withHeaders(['token' => env('API_AUTH_KEY')])
            ->post('http://172.20.1.12/dbstaff/api/getuser', [
                'userid' => $userid,
            ])
            ->json();

        if ($response['status'] == 1) {
            $userData = User::where('user_id', $userid)->first();
            if ($userData == null) {
                $userData          = new User();
                $userData->user_id = $userid;
                $userData->name    = $response['user']['name'];
            }
            $userData->department = $response['user']['department'];
            $userData->position   = $response['user']['position'];
            $userData->save();

            return $userData;
        } else {
            return false;
        }
    }

    public function RolesAdmin(Request $request)
    {
        $validated = $request->validate([
            'userid' => 'required|string|max:255',
        ]);
        $userid   = $request->userid;
        $userData = User::where('user_id', $userid)->first();
        if ($userData == null) {
            $userData = $this->CreateUserData($request->userid);
        }
        $userData->role = 'admin';
        $userData->save();

        return redirect()->route('roles.main')->with('success', 'User created successfully.');
    }

    public function RolesStore(Request $request)
    {
        $validated = $request->validate([
            'userid'   => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
        ]);
        $userid = $request->userid;

        $userData = User::where('user_id', $userid)->first();
        if ($userData == null) {
            $userData = $this->CreateUserData($request->userid);
        }
        if ($userData->role == 'user') {
            $userData->role = 'staff';
        }
        $userData->location = $request->location;
        $userData->save();

        return redirect()->route('roles.main')->with('success', 'User created successfully.');
    }

    public function RolesMassAssignLocation(Request $request)
    {
        $validated = $request->validate([
            'user_ids' => 'required|string',
            'location' => 'required|string|max:255',
        ]);
        $userIds = array_map('trim', explode(',', $validated['user_ids']));
        User::whereIn('user_id', $userIds)->update(['location' => $validated['location']]);
        return redirect()->route('roles.main')->with('success', 'Location assigned to selected users.');
    }

    public function RolesDestroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('roles.main');
    }

    // Asset Type Management Methods
    public function AssetTypesMain(Request $request)
    {
        $query = AssetType::query();
        if ($request->filled('search')) {
            $query->where('asset_type_name', 'like', '%' . $request->search . '%');
        }
        $assetTypes = $query->notDeleted()->with('assets')->get();
        return inertia('asset-types/main', compact('assetTypes'));
    }

    public function AssetTypesCreate()
    {
        return inertia('asset-types/create');
    }

    public function AssetTypesStore(Request $request)
    {
        $validated = $request->validate([
            'asset_type_name' => 'required|string|max:255',
        ]);

        $assetType                  = new AssetType();
        $assetType->asset_type_name = $request->asset_type_name;
        $assetType->save();

        return redirect()->route('asset-types.main')->with('success', 'Asset type created successfully.');
    }

    public function AssetTypesEdit($id)
    {
        $assetType = AssetType::findOrFail($id);
        return inertia('asset-types/edit', [
            'assetType' => $assetType,
        ]);
    }

    public function AssetTypesUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'asset_type_name' => 'required|string|max:255',
        ]);

        $assetType                  = AssetType::findOrFail($id);
        $assetType->asset_type_name = $request->asset_type_name;
        $assetType->save();

        return redirect()->route('asset-types.main')->with('success', 'Asset type updated successfully.');
    }

    public function AssetTypesDestroy($id)
    {
        $assetType             = AssetType::findOrFail($id);
        $assetType->is_deleted = true; // soft delete via boolean flag (see migration)
        $assetType->save();

        return redirect()->route('asset-types.main')->with('success', 'Asset type deleted (soft) successfully.');
    }

    // Control Type Management Methods
    public function ControlTypesMain(Request $request)
    {
        $query = ControlType::query();
        if ($request->filled('search')) {
            $query->where('control_type_name', 'like', '%' . $request->search . '%');
        }
        $controlTypes = $query->notDeleted()->with(['assetType', 'controls'])->get();
        return inertia('control-types/main', compact('controlTypes'));
    }

    public function ControlTypesCreate()
    {
        $assetTypes = AssetType::all();
        return inertia('control-types/create', compact('assetTypes'));
    }

    public function ControlTypesStore(Request $request)
    {
        $validated = $request->validate([
            'asset_type_id'     => 'required|exists:asset_types,id',
            'control_type_name' => 'required|string|max:255',
        ]);

        $controlType                    = new ControlType();
        $controlType->asset_type_id     = $request->asset_type_id;
        $controlType->control_type_name = $request->control_type_name;
        $controlType->save();

        return redirect()->route('control-types.main')->with('success', 'Control type created successfully.');
    }

    public function ControlTypesEdit($id)
    {
        $controlType = ControlType::with('assetType')->findOrFail($id);
        $assetTypes  = AssetType::all();
        return inertia('control-types/edit', [
            'controlType' => $controlType,
            'assetTypes'  => $assetTypes,
        ]);
    }

    public function ControlTypesUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'asset_type_id'     => 'required|exists:asset_types,id',
            'control_type_name' => 'required|string|max:255',
        ]);

        $controlType                    = ControlType::findOrFail($id);
        $controlType->asset_type_id     = $request->asset_type_id;
        $controlType->control_type_name = $request->control_type_name;
        $controlType->save();

        return redirect()->route('control-types.main')->with('success', 'Control type updated successfully.');
    }

    public function ControlTypesDestroy($id)
    {
        $controlType             = ControlType::findOrFail($id);
        $controlType->is_deleted = true; // soft delete via boolean flag (see migration)
        $controlType->save();

        return redirect()->route('control-types.main')->with('success', 'Control type deleted (soft) successfully.');
    }
    // Controls Management
    public function ControlsMain(Request $request)
    {
        $controlTypes = ControlType::notDeleted()->get(['id', 'control_type_name']);
        $controls     = Control::join('control_types', 'control_types.id', '=', 'controls.control_type_id')
            ->where('controls.is_deleted', false)
            ->orderBy('control_type_id')
            ->orderBy('controls.expired')
            ->select('controls.*', 'control_types.control_type_name', 'control_types.asset_type_id')
            ->get();
        foreach ($controls as $control) {
            $assetType                = AssetType::where('id', $control->asset_type_id)->first();
            $control->asset_type_name = $assetType->asset_type_name;
            $value                    = null;
            if ($control->limit_type == 'range') {
                $lv    = LimitValue::where('control_id', $control->id)->where('is_deleted', false)->first();
                $value = $lv->min_value . ' - ' . $lv->max_value;
            } elseif ($control->limit_type == 'option') {
                $lv    = LimitValue::where('control_id', $control->id)->where('is_deleted', false)->get();
                $value = $lv->pluck('option_value')->toArray();
            } elseif ($control->limit_type == 'text') {
                $lv    = LimitValue::where('control_id', $control->id)->where('is_deleted', false)->first();
                $value = $lv->text_value;
            }
            $control->limit_value = $value;
        }

        return inertia('controls/main', compact('controls', 'controlTypes'));
    }

    public function ControlsCreate()
    {
        $controlTypes = ControlType::notDeleted()
            ->with(['assetType:id,asset_type_name'])
            ->get(['id', 'asset_type_id', 'control_type_name']);
        return inertia('controls/create', compact('controlTypes'));
    }

    public function ControlsStore(Request $request)
    {
        $validated = $request->validate([
            'control_name'    => 'required|string|max:255',
            'control_type_id' => 'required|exists:control_types,id',
            'brand'           => 'nullable|string|max:255',
            'lot'             => 'nullable|string|max:255',
            'expired'         => 'nullable|date',
            'limit_type'      => 'required|in:range,option,text',
            // Range
            'min_value'       => 'nullable|required_if:limit_type,range|string',
            'max_value'       => 'nullable|required_if:limit_type,range|string',
            // Option
            'options'         => 'nullable|required_if:limit_type,option|array',
            'options.*'       => 'nullable|string',
            // Text
            'text_value'      => 'nullable|required_if:limit_type,text|string',
            'memo'            => 'nullable|string|max:1000',
        ]);

        $control                  = new Control();
        $control->control_name    = $validated['control_name'];
        $control->control_type_id = $validated['control_type_id'];
        $control->brand           = $validated['brand'] ?? null;
        $control->lot             = $validated['lot'] ?? null;
        $control->expired         = $validated['expired'] ?? null;
        $control->limit_type      = $validated['limit_type'];
        $control->memo            = $validated['memo'] ?? null;
        $control->is_active       = false;
        $control->is_deleted      = false;
        $control->save();

        // Persist limit values based on type
        if ($control->limit_type === 'range') {
            LimitValue::create([
                'control_id' => $control->id,
                'min_value'  => $validated['min_value'],
                'max_value'  => $validated['max_value'],
                'is_deleted' => false,
            ]);
        } elseif ($control->limit_type === 'option') {
            // Create separate record for each option
            $options = array_filter($validated['options'], function ($opt) {
                return $opt !== null && $opt !== '';
            });

            foreach ($options as $option) {
                LimitValue::create([
                    'control_id'   => $control->id,
                    'option_value' => $option,
                    'is_deleted'   => false,
                ]);
            }
        } elseif ($control->limit_type === 'text') {
            LimitValue::create([
                'control_id' => $control->id,
                'text_value' => $validated['text_value'],
                'is_deleted' => false,
            ]);
        }

        return redirect()->route('controls.main')->with('success', 'Control created successfully.');
    }

    public function ControlsEdit($id)
    {
        $control = Control::with(['limitValues' => function ($q) {$q->where('is_deleted', false);}])->findOrFail($id);
        $controlTypes = ControlType::notDeleted()->with(['assetType:id,asset_type_name'])->get(['id', 'asset_type_id', 'control_type_name']);

        $minValue    = '';
        $maxValue    = '';
        $textValue   = '';
        $optionValue = [];

        if ($control->limit_type == 'range' || $control->limit_type == 'text') {
            $limitValue = LimitValue::where('control_id', $control->id)->where('is_deleted', false)->first();
            if ($limitValue) {
                $minValue  = $limitValue->min_value ?? '';
                $maxValue  = $limitValue->max_value ?? '';
                $textValue = $limitValue->text_value ?? '';
            }
        } else {
            // For option type
            $limitValues = LimitValue::where('control_id', $control->id)->where('is_deleted', false)->get();
            foreach ($limitValues as $lv) {
                if ($lv->option_value) {
                    $optionValue[] = $lv->option_value;
                }
            }
        }

        $control = [
            'id'              => $control->id,
            'control_name'    => $control->control_name,
            'control_type_id' => $control->control_type_id,
            'brand'           => $control->brand,
            'lot'             => $control->lot,
            'expired'         => $control->expired,
            'limit_type'      => $control->limit_type,
            'min_value'       => $minValue,
            'max_value'       => $maxValue,
            'options'         => $optionValue,
            'text_value'      => $textValue,
            'memo'            => $control->memo,
        ];

        return inertia('controls/edit', compact('control', 'controlTypes'));
    }

    public function ControlsUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'control_name'    => 'required|string|max:255',
            'control_type_id' => 'required|exists:control_types,id',
            'brand'           => 'nullable|string|max:255',
            'lot'             => 'nullable|string|max:255',
            'expired'         => 'nullable|date',
            'limit_type'      => 'required|in:range,option,text',
            'min_value'       => 'nullable|required_if:limit_type,range|string',
            'max_value'       => 'nullable|required_if:limit_type,range|string',
            'options'         => 'nullable|required_if:limit_type,option|array',
            'options.*'       => 'nullable|string',
            'text_value'      => 'nullable|required_if:limit_type,text|string',
            'memo'            => 'nullable|string|max:1000',
        ]);

        $control                  = Control::findOrFail($id);
        $control->control_name    = $validated['control_name'];
        $control->control_type_id = $validated['control_type_id'];
        $control->brand           = $validated['brand'] ?? null;
        $control->lot             = $validated['lot'] ?? null;
        $control->expired         = $validated['expired'] ?? null;
        $control->limit_type      = $validated['limit_type'];
        $control->memo            = $validated['memo'] ?? null;
        // Always deactivate on update
        $control->is_active = false;
        $control->save();

        // Soft delete existing limit values
        LimitValue::where('control_id', $control->id)->update(['is_deleted' => true]);

        if ($control->limit_type === 'range') {
            // Create single record for range type
            LimitValue::create([
                'control_id' => $control->id,
                'min_value'  => $validated['min_value'],
                'max_value'  => $validated['max_value'],
                'is_deleted' => false,
            ]);
        } elseif ($control->limit_type === 'option') {
            // Create separate record for each option
            $options = array_filter($validated['options'], function ($opt) {
                return $opt !== null && $opt !== '';
            });

            foreach ($options as $option) {
                LimitValue::create([
                    'control_id'   => $control->id,
                    'option_value' => $option,
                    'is_deleted'   => false,
                ]);
            }
        } elseif ($control->limit_type === 'text') {
            // Create single record for text type
            LimitValue::create([
                'control_id' => $control->id,
                'text_value' => $validated['text_value'],
                'is_deleted' => false,
            ]);
        }

        return redirect()->route('controls.main')->with('success', 'Control updated successfully.');
    }

    public function ControlsDestroy($id)
    {
        $control             = Control::findOrFail($id);
        $control->is_deleted = true;
        $control->save();
        // Soft delete related limit values
        LimitValue::where('control_id', $control->id)->update(['is_deleted' => true]);
        return redirect()->route('controls.main')->with('success', 'Control deleted (soft) successfully.');
    }

    public function ControlsSetActive($id)
    {
        $control = Control::findOrFail($id);
        Control::where('control_type_id', $control->control_type_id)->update(['is_active' => false]);
        $control->is_active = true;
        $control->save();
        return redirect()->route('controls.main')->with('success', 'Control set as active.');
    }

    public function ControlsSetInactive($id)
    {
        $control            = Control::findOrFail($id);
        $control->is_active = false;
        $control->save();
        return redirect()->route('controls.main')->with('success', 'Control set as inactive.');
    }

    // Assets Management
    public function AssetsMain(Request $request)
    {
        $assets = Asset::where('is_deleted', false)->with('assetType')->get();
        return inertia('assets/main', compact('assets'));
    }

    public function AssetsOverview(Request $request)
    {
        $query = Asset::where('is_deleted', false)->with('assetType');

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('serial_number', 'like', "%{$search}%")
                    ->orWhere('location', 'like', "%{$search}%")
                    ->orWhere('memo', 'like', "%{$search}%")
                    ->orWhereHas('assetType', function ($assetTypeQuery) use ($search) {
                        $assetTypeQuery->where('asset_type_name', 'like', "%{$search}%");
                    });
            });
        }

        $assets = $query->get();

        // Group assets by location
        $assetsByLocation = $assets->groupBy('location')->map(function ($locationAssets) {
            return $locationAssets->map(function ($asset) {
                return [
                    'id'            => $asset->id,
                    'name'          => $asset->name,
                    'brand'         => $asset->brand,
                    'model'         => $asset->model,
                    'serial_number' => $asset->serial_number,
                    'frequency'     => $asset->frequency,
                    'environment'   => $asset->environment,
                    'memo'          => $asset->memo,
                    'asset_type'    => $asset->assetType ? $asset->assetType->asset_type_name : null,
                    'created_at'    => $asset->created_at,
                    'updated_at'    => $asset->updated_at,
                ];
            });
        });

        return inertia('assets/overview', [
            'assetsByLocation' => $assetsByLocation,
            'search'           => $request->search ?? '',
            'totalAssets'      => $assets->count(),
            'totalLocations'   => $assetsByLocation->count(),
        ]);
    }

    public function AssetsCreate()
    {
        $assetTypes   = AssetType::notDeleted()->get(['id', 'asset_type_name']);
        $getlocations = Asset::groupBy('location')->select('location')->whereNotNull('location')->where('location', '!=', '')->where('is_deleted', false)->get();
        $locations    = [];
        foreach ($getlocations as $location) {
            if (! empty($location->location)) {
                $locations[] = $location->location;
            }
        }
        return inertia('assets/create', compact('assetTypes', 'locations'));
    }

    public function AssetsStore(Request $request)
    {
        $validated = $request->validate([
            'asset_type_id' => 'required|exists:asset_types,id',
            'name'          => 'required|string|max:255',
            'frequency'     => 'nullable|string|max:255',
            'environment'   => 'nullable|string|max:255',
            'brand'         => 'nullable|string|max:255',
            'model'         => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'location'      => 'nullable|string|max:255',
            'memo'          => 'nullable|string|max:1000',
        ]);

        Asset::create($validated + ['is_deleted' => false]);
        return redirect()->route('assets.main')->with('success', 'Asset created successfully.');
    }

    public function AssetsEdit($id)
    {
        $asset        = Asset::findOrFail($id);
        $assetTypes   = AssetType::notDeleted()->get(['id', 'asset_type_name']);
        $getlocations = Asset::groupBy('location')->select('location')->whereNotNull('location')->where('location', '!=', '')->where('is_deleted', false)->get();
        $locations    = [];
        foreach ($getlocations as $location) {
            if (! empty($location->location)) {
                $locations[] = $location->location;
            }
        }
        return inertia('assets/edit', compact('asset', 'assetTypes', 'locations'));
    }

    public function AssetsUpdate(Request $request, $id)
    {
        $validated = $request->validate([
            'asset_type_id' => 'required|exists:asset_types,id',
            'name'          => 'required|string|max:255',
            'frequency'     => 'nullable|string|max:255',
            'environment'   => 'nullable|string|max:255',
            'brand'         => 'nullable|string|max:255',
            'model'         => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'location'      => 'nullable|string|max:255',
            'memo'          => 'nullable|string|max:1000',
        ]);

        $asset = Asset::findOrFail($id);
        $asset->update($validated);
        return redirect()->route('assets.main')->with('success', 'Asset updated successfully.');
    }

    public function AssetsDestroy($id)
    {
        $asset             = Asset::findOrFail($id);
        $asset->is_deleted = true;
        $asset->save();
        return redirect()->route('assets.main')->with('success', 'Asset deleted (soft) successfully.');
    }

    // Records Management
    public function RecordsMain(Request $request)
    {
        $query = Record::with(['controlType.assetType']);

        // Filter by status
        if ($request->filled('status')) {
            if ($request->status === 'unapproved') {
                $query->where('is_deleted', false)->whereNull('approved_by');
            } elseif ($request->status === 'approved') {
                $query->where('is_deleted', false)->whereNotNull('approved_by');
            } elseif ($request->status === 'deleted') {
                $query->where('is_deleted', true);
            } elseif ($request->status === 'all') {
                // Show all records (both deleted and non-deleted)
            }
        } else {
            // Default: show unapproved records
            $query->where('is_deleted', false)->whereNull('approved_by');
        }

        // Filter by creation date
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $records = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($record) {
                // Add additional computed fields for display
                if ($record->is_deleted) {
                    $record->status       = 'Deleted';
                    $record->status_color = 'error';
                } else {
                    $record->status       = $record->approved_by ? 'Approved' : ($record->verified_by ? 'Pending Approval' : 'Draft');
                    $record->status_color = $record->approved_by ? 'success' : ($record->verified_by ? 'warning' : 'default');
                }

                // Add asset type information
                $asset                   = Asset::find($record->asset_id);
                $record->location        = $asset->location ?? 'Unknown';
                $record->asset_type_name = $asset->assetType->asset_type_name ?? 'Unknown';

                return $record;
            });

        return inertia('records/main', compact('records'));
    }

    public function RecordsApprove($id)
    {
        $record              = Record::findOrFail($id);
        $record->approved_by = auth()->user()->name ?? auth()->user()->user_id ?? 'Admin';
        $record->save();

        return redirect()->route('records.main')->with('success', 'Record approved successfully.');
    }

    public function RecordsRemove(Request $request, $id)
    {
        $record              = Record::findOrFail($id);
        $record->approved_by = auth()->user()->name ?? auth()->user()->user_id ?? 'Admin';
        $record->is_deleted  = true;

        // Save memo if provided
        if ($request->has('memo') && $request->memo) {
            $record->memo = $request->memo;
        }

        $record->save();

        return redirect()->route('records.main')->with('success', 'Record removed successfully.');
    }

    public function RecordsRestore($id)
    {
        $record             = Record::findOrFail($id);
        $record->is_deleted = false;
        $record->save();

        return redirect()->route('records.main')->with('success', 'Record restored successfully.');
    }

    public function RecordsByAsset(Request $request, $assetId)
    {
        $asset = Asset::findOrFail($assetId);

        // Get date filter parameters
        $dateFrom = $request->get('date_from', function () {
            $now = new \DateTime();
            return $now->format('Y-m-01'); // First day of current month
        });

        $dateTo = $request->get('date_to', function () {
            $now = new \DateTime();
            return $now->format('Y-m-t'); // Last day of current month
        });

        $allControls = ControlType::where('asset_type_id', $asset->asset_type_id)->where('is_deleted', false)->get();
        $datas       = [];
        foreach ($allControls as $control) {
            $finControl = Control::where('control_type_id', $control->id)->where('is_deleted', false)->where('is_active', true)->first();
            if ($finControl !== null) {
                $datas[$control->control_type_name] = [
                    'control_type_id' => $control->id,
                    'activeControl'   => $finControl,
                    'limit_type'      => $control->limit_type,
                    'show_chart'      => true, // Show chart for all controls with numeric data
                    'show_statistics' => true, // Show statistics for all controls with numeric data
                ];
            }
        }

        // Get records with date filtering
        $records = Record::with(['controlType.assetType'])
            ->where('asset_id', $assetId)
            ->where('is_deleted', false)
            ->when($dateFrom, function ($query, $dateFrom) {
                return $query->whereDate('created_at', '>=', $dateFrom);
            })
            ->when($dateTo, function ($query, $dateTo) {
                return $query->whereDate('created_at', '<=', $dateTo);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Initialize records array for each control type
        foreach ($datas as $controlTypeName => &$data) {
            $data['records'] = [];
        }

        // Group records by control type and format datetime in Bangkok timezone
        foreach ($records as $record) {
            $controlTypeName = $record->controlType->control_type_name;
            if (isset($datas[$controlTypeName])) {
                $datas[$controlTypeName]['records'][] = $record;
            }
        }

        foreach ($datas as $controlTypeName => &$data) {
            if ($data['activeControl'] === null) {
                continue;
            }

            $data['limit_value']             = $this->getLimitValue($data['activeControl']);
            $data['limit_options']           = $this->getLimitOptions($data['activeControl']);
            $data['activeControl']['median'] = $this->getMedian($data['limit_value']);

            // Generate statistics if there are records
            if (! empty($data['records'])) {
                $data['statistics'] = $this->getStatistics($data['records']);
                $data['chart']      = $this->getChart($data['records']);

            }
        }
        // Sort the data by control type name
        ksort($datas);

        return inertia('records/byAsset', compact('datas', 'asset', 'dateFrom', 'dateTo'));
    }

    private function getChart($records)
    {
        $chartData = [];
        foreach ($records as $record) {
            if (is_numeric($record->record_value)) {
                $chartData[] = [
                    'date'        => $record->created_at,
                    'value'       => (float) $record->record_value,
                    'result'      => $record->record_result,
                    'memo'        => $record->memo,
                    'verified_by' => $record->verified_by,
                    'approved_by' => $record->approved_by,
                ];
            }
        }
        return $chartData;
    }

    private function getStatistics($records)
    {
        // Extract numeric values from Record objects that are approved
        $values = [];
        foreach ($records as $record) {
            // Only include records that have been approved (approved_by is not null)
            if ($record->approved_by !== null && $record->is_deleted === false) {
                $value = is_numeric($record->record_value) ? (float) $record->record_value : null;
                if ($value !== null) {
                    $values[] = $value;
                }
            }
        }

        // Return empty statistics if no valid numeric values
        if (empty($values)) {
            return [
                'count' => 0,
                'mean'  => '0.00',
                'sd'    => '0.00',
                'cv'    => '0.00',
                'min'   => '0.00',
                'max'   => '0.00',
            ];
        }

        $statistics          = [];
        $statistics['count'] = count($values);
        $statistics['mean']  = number_format(array_sum($values) / count($values), 2);

        // Calculate standard deviation
        $variance = array_sum(array_map(function ($value) use ($statistics) {
            return pow($value - (float) $statistics['mean'], 2);
        }, $values)) / count($values);
        $statistics['sd'] = number_format(sqrt($variance), 2);

        // Calculate coefficient of variation (avoid division by zero)
        $meanValue         = (float) $statistics['mean'];
        $sdValue           = (float) $statistics['sd'];
        $statistics['cv']  = $meanValue != 0 ? number_format(($sdValue / $meanValue) * 100, 2) : '0.00';
        $statistics['min'] = number_format(min($values), 2);
        $statistics['max'] = number_format(max($values), 2);

        return $statistics;
    }

    private function getMedian($limitValue)
    {
        if (str_contains($limitValue, '-')) {
            $explode = explode('-', $limitValue);
            $min     = $explode[0];
            $max     = $explode[1];
            $median  = ($min + $max) / 2;
        } else {
            return null;
        }
        return number_format($median, 2);
    }

    public function RecordsByAssetStore(Request $request, $assetId)
    {
        $validated = $request->validate([
            'control_type_id' => 'required|exists:control_types,id',
            'record_value'    => 'required|string|max:255',
            'record_result'   => 'nullable|string|max:255',
            'memo'            => 'nullable|string|max:1000',
            'created_at'      => 'required|date_format:Y-m-d H:i:s',
        ]);

        $record                  = new Record();
        $record->asset_id        = $assetId;
        $record->control_type_id = $validated['control_type_id'];
        $record->record_value    = $validated['record_value'];
        $record->record_result   = $validated['record_result'] ?? null;
        $record->memo            = $validated['memo'] ?? null;
        $record->verified_by     = auth()->user()->user_id ?? 'Admin';
        $record->approved_by     = auth()->user()->name ?? auth()->user()->user_id ?? 'Admin';

        $record->created_at = $validated['created_at'];
        $record->updated_at = $validated['created_at'];
        $record->save();

        return redirect()->route('records.byAsset', $assetId)->with('success', 'Record added successfully!');
    }

    public function RecordsByAssetDestroy(Request $request, $assetId, $recordId)
    {
        $record = Record::where('asset_id', $assetId)
            ->where('id', $recordId)
            ->firstOrFail();

        $record->is_deleted = true;
        $record->memo       = $request->get('memo', 'Deleted via asset records page');
        $record->save();

        return redirect()->route('records.byAsset', $assetId)->with('success', 'Record deleted successfully.');
    }

    public function RecordsByAssetApprove(Request $request, $assetId, $recordId)
    {
        $record = Record::where('asset_id', $assetId)
            ->where('id', $recordId)
            ->firstOrFail();

        $record->approved_by = auth()->user()->name ?? auth()->user()->user_id ?? 'Admin';
        $record->save();

        return redirect()->route('records.byAsset', $assetId)->with('success', 'Record approved successfully.');
    }

    public function UserGuide()
    {
        return inertia('documents/guide');
    }

}
