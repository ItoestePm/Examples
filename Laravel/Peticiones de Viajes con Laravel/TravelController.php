<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Customer;
use App\Travel;
use App\Driver;
use App\Genre;
use App\TypeVehicle;
use App\TypeTravel;
use App\GenreTravel;
use App\PaymentMethod;
use App\Passenger;
use App\Waypoint;

class TravelController extends Controller
{
    public $successStatus = 200;

    public function storeCustomerTravel(Request $request, Customer $customer)
    {
        $user = \Auth::user();
        if ($user->customer_id) {
            if ($user->customer->approved == 1) {
                # code...
            } else {
                \Auth::logout();
                return redirect('/admin/login')->with('message', 'Su cuenta sido deshabilitada, intente de nuevo mas tarde.');
            }
        }
        try {
            $travel = new Travel;
            if (isset($request->voucher)) {
              $travel->voucher = $request->voucher;
            }
            if (isset($request->driver_id)) {
              $travel->driver_id = $request->driver_id;
              $travel->status = 3;
            }

            $travel->payment_method_id = $request->payment_method_idNow;
            $travel->typetravel_id = $request->typetravel_idNow;
            $travel->typevehicle_id = $request->typevehicle_idNow;
            $travel->cost_center_id = $request->costcenter_idNow;
            $travel->user_id = $request->user_idNow;
            $travel->customer_id = $request->customer_idNow;
            $travel->origin_address = $request->origin_addressNow;
            $travel->destiny_address = $request->destiny_addressNow;
            $travel->distance = $request->distanceNow;
            $travel->origin_lat = $request->origin_latNow;
            $travel->origin_lng = $request->origin_lngNow;
            $travel->destiny_lat = $request->destiny_latNow;
            $travel->destiny_lng = $request->destiny_lngNow;
            $travel->price_base = $request->price_baseNow;
            $travel->price_km = $request->price_kmNow;
            $travel->price_time = $request->price_timeNow;
            $travel->total = $request->totalNow;
            $travel->final_total = 0;
            $travel->speak = $request->speakNow;
            $travel->music = $request->musicNow;
            $travel->schedule = $request->schedule;
            $travel->schedule_datetime = date('Y-m-d H:i', strtotime("$request->date_schedule $request->hour_schedule"));
            $travel->poster = $request->posterNow;
            $travel->poster_name = $request->poster_nameNow;
            $travel->name = $request->nameNow;
            $travel->last_name = $request->last_nameNow;
            $travel->phone = $request->phoneNow;
            $travel->details = $request->detailsNow;
            $travel->save();

            if (isset($request->driver_id)) {
              $driver = Driver::find($request->driver_id);

              $to_name = $driver->user->name;
              $to_email = $driver->user->email;
              $data = [
                  'name'=>$driver->user->name,
                  'travel'=>$travel,
                  'travel_user'=>$travel->user->name,
                  'startAddress'=>$travel->origin_address,
                  'destinyAddress'=>$travel->destiny_address
              ];

              \Mail::send('emails.mail', $data, function ($message) use ($to_name, $to_email, $travel) {
                  $message->to($to_email, $to_name)
              ->subject('El viaje número '.$travel->id.' se le ha asignado');
                  $message->from($to_email, 'El viaje número '.$travel->id.' se le ha asignado');
              });
            }

            $data = [];

            if (isset($request->genresNow)) {
                foreach ($request->genresNow as $gen) {
                    $data[] = [
                        'travel_id' => $travel->id,
                        'genre_id' => $gen
                    ];
                }
            }

            $dataPassenger = [];

            if (isset($request->name_passenger)) {
                for ($i=0; $i < count($request->name_passenger) ; $i++) {
                    $dataPassenger[$i] = [
                       'customer_id' => $request->customer_idNow,
                       'travel_id' => $travel->id,
                       'name' => $request->name_passenger[$i],
                       'last_name' => $request->lastname_passenger[$i],
                       'phone' => $request->phone_passenger[$i],
                    ];
                }
            }

            $dataWaypoint = [];
            if (isset($request->waypoint_now)) {
                for ($i=0; $i < count($request->waypoint_now) ; $i++) {
                    $dataWaypoint[$i] = [
                       'travel_id' => $travel->id,
                       'location' => $request->waypoint_now[$i],
                       'lng' => $request->waypoint_nowlng[$i],
                       'lat' => $request->waypoint_nowlat[$i],
                    ];
                }
            }

            GenreTravel::insert($data);
            Passenger::insert($dataPassenger);
            Waypoint::insert($dataWaypoint);

            if (isset($request->driver_id)) {
              return redirect('/admin/dashboard')->with('message', 'Se ha creado el viaje correctamente.');

            }else {
              return redirect('/'.$customer->slug)->with('message', 'Se ha creado el viaje correctamente.');
            }

        } catch (\Throwable $th) {
            return redirect('/'.$customer->slug)->with('message', 'Ha ocurrido un error, por favor intenta nuevamente.');
        }
    }

    public function updateCustomerTravel(Request $request, Customer $customer, Travel $travel)
    {
        $user = \Auth::user();

        try {
            if (isset($request->voucher)) {
              $travel->voucher = $request->voucher;
            }
            if (isset($request->driver_id)) {
              $travel->driver_id = $request->driver_id;
            }
            $travel->user_id = $travel->user_id;
            $travel->payment_method_id = $request->payment_method_idNow;
            $travel->typetravel_id = $request->typetravel_idNow;
            $travel->typevehicle_id = $request->typevehicle_idNow;
            $travel->cost_center_id = $request->costcenter_idNow;
            $travel->modify_user = $request->modify_userNow;
            $travel->customer_id = $request->customer_idNow;
            $travel->origin_address = $request->origin_addressNow;
            $travel->destiny_address = $request->destiny_addressNow;
            $travel->distance = $request->distanceNow;
            $travel->origin_lat = $request->origin_latNow;
            $travel->origin_lng = $request->origin_lngNow;
            $travel->destiny_lat = $request->destiny_latNow;
            $travel->destiny_lng = $request->destiny_lngNow;
            if (isset($request->price_baseNow)) {
                $travel->price_base = $request->price_baseNow;
            }
            if (isset($request->price_kmNow)) {
                $travel->price_km = $request->price_kmNow;
            }
            if (isset($request->price_timeNow)) {
                $travel->price_time = $request->price_timeNow;
            }
            if(isset($request->totalNow)){
                $travel->total = $request->totalNow;
            }
            if(isset($request->final_total)){
                $travel->final_total = $request->final_total;
            }
            if(isset($request->price_toll)){
                $travel->price_toll = $request->price_toll;
            }
            if(isset($request->price_others)){
                $travel->price_others = $request->price_others;
            }
            $travel->speak = $request->speakNow;
            $travel->music = $request->musicNow;
            $travel->schedule = $request->schedule;
            $travel->schedule_datetime = date('Y-m-d H:i', strtotime("$request->date_schedule $request->hour_schedule"));
            $travel->poster = $request->posterNow;
            $travel->poster_name = $request->poster_nameNow;
            $travel->name = $request->nameNow;
            $travel->last_name = $request->last_nameNow;
            $travel->phone = $request->phoneNow;
            $travel->details = $request->detailsNow;
            $travel->description = $request->description;
            $travel->save();

            /* if (isset($request->driver_id)) {
              $driver = Driver::find($request->driver_id);

              $to_name = $driver->user->name;
              $to_email = $driver->user->email;
              $data = [
                  'name'=>$driver->user->name,
                  'travel'=>$travel,
                  'travel_user'=>$travel->user->name,
                  'startAddress'=>$travel->origin_address,
                  'destinyAddress'=>$travel->destiny_address
              ];

              \Mail::send('emails.mail', $data, function ($message) use ($to_name, $to_email, $travel) {
                  $message->to($to_email, $to_name)
              ->subject('El viaje número '.$travel->id.' se le ha asignado');
                  $message->from($to_email, 'El viaje número '.$travel->id.' se le ha asignado');
              });
            } */

            $data = [];

            if (isset($request->genresNow)) {
                foreach ($request->genresNow as $gen) {
                    $data[] = [
                        'travel_id' => $travel->id,
                        'genre_id' => $gen
                    ];
                }
            }

            $dataPassenger = [];

            if (isset($request->name_passenger)) {
                for ($i=0; $i < count($request->name_passenger) ; $i++) {
                    $dataPassenger[$i] = [
                       'customer_id' => $request->customer_idNow,
                       'travel_id' => $travel->id,
                       'name' => $request->name_passenger[$i],
                       'last_name' => $request->lastname_passenger[$i],
                       'phone' => $request->phone_passenger[$i],
                    ];
                }
            }

            $dataWaypoint = [];
            if (isset($request->waypoint_now)) {
                for ($i=0; $i < count($request->waypoint_now) ; $i++) {
                    $dataWaypoint[$i] = [
                       'travel_id' => $travel->id,
                       'location' => $request->waypoint_now[$i],
                       'lng' => $request->waypoint_nowlng[$i],
                       'lat' => $request->waypoint_nowlat[$i],
                    ];
                }
            }
            
            $deleteGenre = GenreTravel::where('travel_id', $travel->id)->get();
            $deletePassenger = Passenger::where('travel_id', $travel->id)->get();
            $deleteWaypoint = Waypoint::where('travel_id', $travel->id)->get();

            for ($i=0; $i < count($deleteGenre); $i++) { 
                $deleteGenre[$i]->delete();

            }


            for ($i=0; $i < count($deletePassenger); $i++) { 
                $deletePassenger[$i]->delete();
            }

            for ($i=0; $i < count($deleteWaypoint); $i++) { 
                $deleteWaypoint[$i]->delete();
            }
 
            GenreTravel::insert($data);
            Passenger::insert($dataPassenger);
            Waypoint::insert($dataWaypoint);

              return redirect()->back()->with('message', 'Se ha modificado el viaje correctamente.');


        } catch (\Throwable $th) {
            return redirect('/'.$customer->slug)->with('message', 'Ha ocurrido un error, por favor intenta nuevamente.');
        }
    }

    public function travelEdit(Travel $travel)
    {
        $user = \Auth::user();

        $drivers = Driver::all();
        $genres = Genre::all();
        $travelsPendingUser = $user->travelsPending;
        $paymentmethods = PaymentMethod::all();
        $typevehicles = TypeVehicle::all();
        $typetravels = TypeTravel::all();
        $customer = Customer::find($travel->customer_id);
        $costcenters = $customer->costcenters;
        return view('admin.customers.travels.edit', compact('customer', 'travel', 'paymentmethods', 'genres', 'drivers', 'typevehicles', 'costcenters', 'typetravels', 'travelsPendingUser', 'user'));
    }

    public function confirmTravel(Travel $travel)
    {
        $travel->confirmed = 1;
        $travel->save();

        return redirect('/')->with('message', 'Confirmación de lectura guardada correctamente.');
    }

    public function checkStatus(Travel $travel)
    {
        if ($travel->confirmed != 1) {
            return response()->json(['data'=> 0], $this->successStatus);
        } else {
            return response()->json(['data'=> 1], $this->successStatus);
        }
    }

    public function travelsCheckPending()
    {
      $data = Travel::where('status', 2)->orderBy('id', 'asc')->with('customer', 'costcenter', 'typeVehicle', 'typeTravel', 'passengers')->get();

      return response()->json($data, $this->successStatus);

    }

    public function createTravel(Customer $customer)
    {
        $user = \Auth::user();

        $drivers = Driver::all();
        $genres = Genre::all();
        $travelsPendingUser = $user->travelsPending;
        $paymentmethods = PaymentMethod::all();
        $typevehicles = TypeVehicle::all();
        $typetravels = TypeTravel::all();
        $costcenters = $customer->costcenters;
        return view('admin.travels.create', compact('customer', 'paymentmethods', 'genres', 'drivers', 'typevehicles', 'costcenters', 'typetravels', 'travelsPendingUser', 'user'));
    }
}
