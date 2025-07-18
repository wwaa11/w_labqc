<?php
namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Control;
use App\Models\Procedure;
use App\Models\Record;
use App\Models\User;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WebController extends Controller
{
    public function index()
    {
        $assets = Asset::with(['procedures.control', 'procedures.last_record'])->where('location', auth()->user()->location)->get();

        return inertia('index', compact('assets'));
    }

    public function RecordStore(Request $request)
    {
        $validated = $request->validate([
            'procedure_id' => 'required|integer|exists:procedures,id',
            'value'        => 'required|string',
            'result'       => 'required|in:PASS,FAILED',
        ]);
        $record               = new Record;
        $record->procedure_id = $request->procedure_id;
        $record->value        = $request->value;
        $record->result       = $request->result;
        $record->verified_by  = auth()->user()->user_id;
        $record->save();

        return redirect()->route('index');
    }

    public function AssetsMain()
    {
        $assets = Asset::all();

        return inertia('assets/main', compact('assets'));
    }

    public function AssetsCreate()
    {
        $controls = Control::all();

        return inertia('assets/create', compact('controls'));
    }

    public function AssetsStore(Request $request)
    {
        $asset                = new Asset;
        $asset->type          = $request->type;
        $asset->name          = $request->name;
        $asset->frequency     = $request->frequency;
        $asset->environment   = $request->environment;
        $asset->brand         = $request->brand;
        $asset->model         = $request->model;
        $asset->serial_number = $request->serial_number;
        $asset->location      = $request->location;
        $asset->memo          = $request->memo;
        $asset->save();

        foreach ($request->controls as $control) {
            $new_control             = new Procedure;
            $new_control->asset_id   = $asset->id;
            $new_control->control_id = $control;
            $new_control->save();
        }

        return redirect()->route('assets.main');
    }

    public function AssetsEdit($id)
    {
        $asset            = Asset::findOrFail($id);
        $controls         = Control::all();
        $current_controls = $asset->procedures()->pluck('control_id')->toArray();
        return inertia('assets/edit', [
            'asset'            => $asset,
            'controls'         => $controls,
            'current_controls' => $current_controls,
        ]);
    }

    public function AssetsUpdate(Request $request, $id)
    {
        $asset = Asset::findOrFail($id);

        $validated = $request->validate([
            'type'          => 'required|string|max:255',
            'name'          => 'required|string|max:255',
            'environment'   => 'required|string|max:255',
            'frequency'     => 'required|string|max:255',
            'brand'         => 'nullable|string|max:255',
            'model'         => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'location'      => 'required|string|max:255',
            'memo'          => 'nullable|string',
            'controls'      => 'array',
        ]);

        $asset->update($validated);

        // Update procedures (controls)
        // Remove old procedures
        $asset->procedures()->delete();
        // Add new procedures
        if (! empty($request->controls)) {
            foreach ($request->controls as $control) {
                $new_control             = new Procedure();
                $new_control->asset_id   = $asset->id;
                $new_control->control_id = $control;
                $new_control->save();
            }
        }

        return redirect()->route('assets.main')->with('success', 'Asset updated successfully.');
    }

    public function AssetsDestroy($id)
    {
        $asset = Asset::findOrFail($id);
        $asset->delete();

        return redirect()->route('assets.main');
    }

    public function ContolsMain()
    {
        $controls = Control::all();

        return inertia('controls/main', compact('controls'));
    }

    public function ContolsCreate()
    {

        return inertia('controls/create');
    }

    public function ContolsStore(Request $request)
    {
        $control          = new Control;
        $control->name    = $request->name;
        $control->limit   = $request->limit;
        $control->brand   = $request->brand;
        $control->lot     = $request->lot;
        $control->expired = $request->expired;
        $control->memo    = $request->memo;
        $control->save();

        return redirect()->route('controls.main');
    }

    public function ContolsDestroy($id)
    {
        $control = Control::findOrFail($id);
        $control->delete();

        return redirect()->route('controls.main');
    }

    public function UsersMain()
    {
        $users        = User::all();
        $getlocations = Asset::groupBy('location')->select('location')->get();
        $locations    = [];
        foreach ($getlocations as $location) {
            $locations[] = $location->location;
        }

        return inertia('users/main', [
            'users'     => $users,
            'locations' => $locations,
            'auth'      => [
                'user' => auth()->user(),
            ],
        ]);
    }

    public function CreateUserData($userid)
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

    public function UsersAdmin(Request $request)
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

        return redirect()->route('users.main')->with('success', 'User created successfully.');
    }

    public function UsersStore(Request $request)
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

        return redirect()->route('users.main')->with('success', 'User created successfully.');
    }

    public function UsersDestroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return redirect()->route('users.main');
    }

    public function monitoring()
    {
        $assets  = Asset::with(['procedures.control', 'procedures.last_record'])->get();
        $grouped = $assets->groupBy('location')->map(function ($assets, $location) {
            return [
                'location' => $location,
                'assets'   => $assets->values(),
            ];
        })->values();
        return inertia('monitoring', [
            'locations' => $grouped,
        ]);
    }

    public function assetView($id)
    {
        $asset = Asset::with(['procedures.control', 'procedures.records'])->findOrFail($id);

        return inertia('assets/view', [
            'asset' => $asset,
        ]);
    }
}
