<?php
namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\AssetType;
use App\Models\Control;
use App\Models\ControlType;
use App\Models\LimitValue;
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

        $assets = Asset::query()
            ->where('location', $userLocation)
            ->where('is_deleted', false)
            ->whereHas('assetType', function ($q) {
                $q->notDeleted()->whereHas('controlTypes', function ($q2) {
                    $q2->notDeleted()->whereHas('controls', function ($q3) {
                        $q3->where('is_deleted', false)->active();
                    });
                });
            })
            ->with([
                'assetType'                                   => function ($q) {$q->notDeleted();},
                'assetType.controlTypes'                      => function ($q) {$q->notDeleted();},
                'assetType.controlTypes.controls'             => function ($q) {$q->where('is_deleted', false)->active();},
                'assetType.controlTypes.controls.limitValues' => function ($q) {$q->where('is_deleted', false);},
                // Load latest non-deleted record per control type via relation
                'assetType.controlTypes.latestRecord'         => function ($q) {$q->where('is_deleted', false);},
            ])
            ->get();

        // Prepare UI-friendly fields for the frontend (move presentation logic to backend)
        $assets = $assets->map(function ($asset) {
            if (! $asset->relationLoaded('assetType') || ! $asset->assetType) {
                return $asset;
            }

            $asset->assetType->setRelation('controlTypes', $asset->assetType->controlTypes->map(function ($ct) {
                $ct->setRelation('controls', $ct->controls->map(function ($control) {
                    // Normalize limit values for consistent frontend usage
                    $limitValue = $control->limitValues;
                    $normalized = $limitValue ? [
                        'min_value'    => $limitValue->min_value,
                        'max_value'    => $limitValue->max_value,
                        'option_value' => $limitValue->option_value,
                        'text_value'   => $limitValue->text_value,
                    ] : null;
                    $control->setAttribute('limit_values_normalized', $normalized);

                    // Provide UI helpers based on limit type
                    if ($control->limit_type === 'range') {
                        $lv     = $control->limitValues;
                        $minStr = $lv?->min_value ?? '';
                        $maxStr = $lv?->max_value ?? '';
                        $hasMin = $minStr !== '' && $minStr !== null;
                        $hasMax = $maxStr !== '' && $maxStr !== null;
                        $label  = ($hasMin || $hasMax)
                        ? ($hasMin ? $minStr : '') . ($hasMin && $hasMax ? ' - ' : '') . ($hasMax ? $maxStr : '')
                        : '';

                        $control->setAttribute('ui_input_type', 'number');
                        $control->setAttribute('ui_label', $label ?: 'Range');
                        $control->setAttribute('ui_min', $hasMin ? (float) $minStr : null);
                        $control->setAttribute('ui_max', $hasMax ? (float) $maxStr : null);
                    } elseif ($control->limit_type === 'option') {
                        $limitValue  = $control->limitValues;
                        $optionValue = $limitValue?->option_value;
                        $options     = $optionValue && $optionValue !== '' ? explode(',', $optionValue) : [];
                        $control->setAttribute('ui_input_type', 'select');
                        $control->setAttribute('ui_options', $options);
                        $control->setAttribute('ui_label', 'Result');
                    } else { // text
                        $control->setAttribute('ui_input_type', 'text');
                        $control->setAttribute('ui_label', 'Result');
                    }

                    return $control;
                }));

                return $ct;
            }));

            return $asset;
        });

        return inertia('users/dashboard', [
            'assets' => $assets,
        ]);
    }

    // Create a record for a control type, validating against the active control's limits
    public function RecordsStore(Request $request)
    {
        $validated = $request->validate([
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
        $controls     = Control::with(['controlType', 'limitValues' => function ($q) {$q->where('is_deleted', false);}])
            ->where('controls.is_deleted', false)
            ->join('control_types', 'control_types.id', '=', 'controls.control_type_id')
            ->orderBy('control_types.control_type_name')
            ->orderBy('controls.expired')
            ->select('controls.*')
            ->get();
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
            $options = array_filter($validated['options'], function ($opt) {
                return $opt !== null && $opt !== '';
            });
            LimitValue::create([
                'control_id'   => $control->id,
                'option_value' => implode(',', $options),
                'is_deleted'   => false,
            ]);
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

        // soft-remove existing values
        LimitValue::where('control_id', $control->id)->update(['is_deleted' => true]);

        if ($control->limit_type === 'range') {
            LimitValue::create([
                'control_id' => $control->id,
                'min_value'  => $validated['min_value'],
                'max_value'  => $validated['max_value'],
                'is_deleted' => false,
            ]);
        } elseif ($control->limit_type === 'option') {
            $options = array_filter($validated['options'], function ($opt) {
                return $opt !== null && $opt !== '';
            });
            LimitValue::create([
                'control_id'   => $control->id,
                'option_value' => implode(',', $options),
                'is_deleted'   => false,
            ]);
        } elseif ($control->limit_type === 'text') {
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

    // Assets Management
    public function AssetsMain(Request $request)
    {
        $assets = Asset::where('is_deleted', false)->with('assetType')->get();
        return inertia('assets/main', compact('assets'));
    }

    public function AssetsCreate()
    {
        $assetTypes = AssetType::notDeleted()->get(['id', 'asset_type_name']);
        return inertia('assets/create', compact('assetTypes'));
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
        $asset      = Asset::findOrFail($id);
        $assetTypes = AssetType::notDeleted()->get(['id', 'asset_type_name']);
        return inertia('assets/edit', compact('asset', 'assetTypes'));
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
}
