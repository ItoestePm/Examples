@extends('customer.layout.app')

@section('title')
<title>
    Recipe Create Travel Laravel <3 {{$customer->alias}}
</title>
@endsection

<div class="container">

    <div class="row">
        <div class="col s12">
            @include('customer.layout.navbar.customer')
        </div>
    </div>

    <div class="row">
        @if (url()->previous() != \Request::url())
        <div class="col s12 m3">
            <a href="{{url()->previous()}}" class="waves-effect waves-light btn-large black hoverable"><i class="material-icons left">chevron_left</i> Regresar</a>
        </div>
      @else
        <div class="col s12 m3">
            <a href="{{url(''.$customer->slug.'/travels?all=1')}}" class="waves-effect waves-light btn-large blue hoverable"><i class="material-icons left">chevron_left</i> Ver Viajes</a>
        </div>
        <div class="col s12 m3">
            <a href="{{url(''.$customer->slug.'')}}" class="waves-effect waves-light btn-large orange hoverable"><i class="material-icons right">chevron_right</i> Inicio</a>
        </div>
      @endif
    </div>

    <div class="row">
        <div class="col s12 m6">
            <div class="card hoverable">
                <div class="card-content black-text" style="padding-right:0px;padding-left:0px;padding-bottom:0px;">
                    <span class="card-title" style="padding-left:10px">Pedir viaje</span>
                    <ul class="collapsible z-depth-0">
                        <li class="active">
                            <div class="collapsible-header"><i class="material-icons">navigation</i>Rellene el Formulario</div>
                            <div class="collapsible-body">
                                <form action="{{url('/'.$customer->slug.'/store')}}" method="POST">
                                    @csrf
                                    <input class="hide" type="text" name="user_idNow" id="user_idNow" value="{{\Auth::user()->id}}">
                                    <input class="hide" type="text" name="customer_idNow" id="customer_idNow" value="{{$customer->id}}">
                                    <input class="hide" type="text" name="origin_addressNow" id="origin_addressNow">
                                    <input class="hide" type="text" name="destiny_addressNow" id="destiny_addressNow">
                                    <input class="hide" type="text" name="distanceNow" id="distanceNow">
                                    <input class="hide" type="text" name="origin_latNow" id="origin_latNow">
                                    <input class="hide" type="text" name="origin_lngNow" id="origin_lngNow">
                                    <input class="hide" type="text" name="destiny_latNow" id="destiny_latNow">
                                    <input class="hide" type="text" name="destiny_lngNow" id="destiny_lngNow">
                                    <input class="hide" type="text" name="price_baseNow" value="{{$customer->price_base}}" id="price_baseNow">
                                    <input class="hide" type="text" name="price_kmNow" value="0" id="price_kmNow">
                                    <input class="hide" type="text" name="price_timeNow" value="0" id="price_timeNow">
                                    <input class="hide" type="text" name="totalNow" id="totalNow">
                                    <div class="row">
                                        <div class="input-field col s12">
                                            <input id="origin_now" type="text" placeholder="Introduce una ubicación" autocomplete="off" required>
                                            <label for="origin_now">Punto de Partida</label>
                                        </div>
                                        <span class="card-title" style="padding-left:10px">Destinos </span>
                                        <div class="input-field col s12">
                                            <input id="destiny_now" type="text" placeholder="Introduce una ubicación" class="destiny_now" autocomplete="off" required>
                                            <label for="destiny_now">Introducir Destino</label>
                                        </div>

                                        <div class="input-field col s12">
                                            <input id="waypoint_now" type="text" placeholder="Introduce una ubicación" class="destiny_now" autocomplete="off">
                                            <label for="destiny_now">Agregar paradas</label>

                                        </div>
                                        <div class="col s12">
                                            <p>
                                                <label>
                                                    <input type="checkbox" id="checkSchedule" name="schedule" value="1" />
                                                    <span>¿Desea programar el viaje?</span>
                                                </label>
                                            </p>
                                            <div id="showSchedule" class="hide">
                                                <div class="input-field col s12">
                                                    <input type="text" name="date_schedule" class="datepicker">
                                                    <label for="first_name">Selecciona la fecha</label>
                                                </div>
                                                <div class="input-field col s12">
                                                    <input type="text" name="hour_schedule" class="timepicker">
                                                    <label for="first_name">Selecciona la hora</label>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col s12">
                                            <br>

                                            <p>
                                                <label>
                                                    <input type="checkbox" name="speakNow" value="1" />
                                                    <span>¿Desea que le hablen?</span>
                                                </label>
                                            </p>
                                            <br>
                                            <p>
                                                <label>
                                                    <input type="checkbox" id="checkGenre" name="musicNow" value="1" />
                                                    <span>¿Desea escuchar música?</span>
                                                </label>
                                            </p>
                                            <br>
                                        </div>
                                        <div class="input-field col s12 hide" id="showGenre">
                                            <select name="genresNow[]" multiple>
                                                <option value="" disabled>Selecciona una opción</option>

                                                @foreach ($genres as $g)
                                                <option value="{{$g->id}}">{{$g->name}}</option>
                                                @endforeach
                                            </select>
                                            <label>Selecciona tus géneros preferidos</label>
                                        </div>

                                        <div class="col s12">
                                            <p>
                                                <label>
                                                    <input type="checkbox" id="checkPoster" name="posterNow" value="1" />
                                                    <span>¿Desea que se anuncien mediante un cartel?</span>
                                                </label>
                                            </p>
                                            <br>

                                        </div>
                                        <div class="input-field col s12 hide" id="showPoster">
                                            <input id="poster_nameNow" name="poster_nameNow" type="text" class="validate" autocomplete="off">
                                            <label for="poster_nameNow">Escriba como quiere que lo llamen</label>

                                        </div>
                                        <div class="col s12">
                                            <br>
                                            <hr style="color:#9E9E9E">
                                        </div>
                                        <div class="input-field col s12">
                                            <textarea id="detailsNow" name="detailsNow" class="materialize-textarea"></textarea>
                                            <label for="detailsNow">Otros detalles a saber </label>
                                        </div>
                                        <div class="col s12">
                                            <span class="card-title">Pasajeros <a href="#!" class="btn-floating btn-small waves-effect waves-light green" onclick="addRow()"><i class="material-icons">add</i></a></span>
                                            <table class="highlight">
                                                <thead>
                                                    <tr>
                                                        <th>Nombre</th>
                                                        <th>Apellido</th>
                                                        <th>Telefono</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="passengerRow">
                                                    <tr>
                                                        <td><input name="name_passenger[]" required></td>
                                                        <td><input name="lastname_passenger[]" required></td>
                                                        <td><input name="phone_passenger[]" required></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div class="input-field col s12">
                                            <select name="costcenter_idNow" required>
                                                <option value="" disabled selected>Selecciona un centro de costos</option>
                                                @foreach ($costcenters as $cc)
                                                <option value="{{$cc->id}}">{{$cc->name}}</option>
                                                @endforeach
                                            </select>
                                            <label>Selecciona un centro de costos</label>
                                        </div>
                                        <div class="input-field col s12">
                                            <select name="payment_method_idNow" required>
                                                <option value="" selected>Selecciona un método de pago</option>
                                                @foreach ($paymentmethods as $pmt)
                                                <option  value="{{$pmt->id}}">{{$pmt->name}}</option>
                                                @endforeach
                                            </select>
                                            <label>Selecciona un método de pago</label>
                                        </div>
                                        <div class="input-field col s12">
                                            <select name="typetravel_idNow" id="typetravel" required>
                                                <option value="" data-price="1" selected>Selecciona un tipo de viaje</option>
                                                @foreach ($typetravels as $tt)
                                                <option data-price="{{$tt->value_multi}}" value="{{$tt->id}}">{{$tt->name}}</option>
                                                @endforeach
                                            </select>
                                            <label>Selecciona un tipo de viaje</label>
                                        </div>
                                        <div class="input-field col s12">
                                            <select name="typevehicle_idNow" id="typevehicle" required>
                                                <option value="" data-price="1" selected>Selecciona un tipo de vehículo</option>
                                                @foreach ($typevehicles as $vt)
                                                <option data-price="{{$vt->value_multi}}" value="{{$vt->id}}">{{$vt->name}}</option>
                                                @endforeach
                                            </select>
                                            <label>Selecciona un tipo de vehículo</label>
                                        </div>
                                        <div class="col s12" style="margin-top:25px">
                                            <button type="submit" class="waves-effect waves-light btn black col s12">Pedir Viaje</button>
                                        </div>
                                    </div>
                                    <div id="innerInputValue"></div>

                                    <div id="modal1" class="modal">
                                        <div class="modal-content">
                                            <h4>Especifique el horario y fecha del viaje</h4>
                                            <br>
                                            <div class="row">
                                                <div class="col s12">
                                                    <p>
                                                        <label>
                                                            <input type="checkbox" id="checkSchedule" name="schedule" value="1" />
                                                            <span>¿Desea programar el viaje?</span>
                                                        </label>
                                                    </p>
                                                </div>

                                            </div>

                                        </div>
                                        <div class="modal-footer">
                                            <button type="submit" class="modal-close waves-effect waves-green btn green">Confirmar Viaje</button>
                                        </div>
                                    </div>

                                </form>
                            </div>
                        </li>
                        {{-- <li>
                          <div class="collapsible-header"><i class="material-icons">access_time</i>Viaje Programado</div>
                          <div class="collapsible-body"><span>Lorem ipsum dolor sit amet.</span></div>
                        </li> --}}
                    </ul>
                </div>
            </div>
        </div>
        <div class="col s12 m6">
            <div class="card hoverable" style="border-radius:5px;border-bottom-right-radius:10px;border-bottom-left-radius:10px">
                <div class="center-align" style="padding:2px">
                    <b style="font-size:12px">
                    
                </div>
                <div class="card-content black-text" style="padding:0;">
                    <div style="height:50%;width:100%;padding:0;border-radius:5px" id="map"></div>
                </div>
                <div id="showPrice">

                </div>
            </div>
            <div class="card hoverable" style="border-radius:5px;border-bottom-right-radius:10px;border-bottom-left-radius:10px">
                <div class="card-content black-text">
                    <span class="card-title">Paradas </span>
                    <div id="innerInput"></div>
                </div>
            </div>
        </div>
    </div>

    @push('jsc')

    @php
    $daysSpanish = [
    1 => 'Lunes',
    2 => 'Martes',
    3 => 'Miercoles',
    4 => 'Jueves',
    5 => 'Viernes',
    6 => 'Sábado',
    7 => 'Domingo',
    ];
    $dateNow = Carbon\Carbon::now();
    $dateDay = $daysSpanish[$dateNow->dayOfWeek];
    $dateHour = $dateNow->hour.':'.$dateNow->minute.':00';

    @endphp

    <script>
        $(document).ready(function() {
            $('.modal').modal();
            $('.datepicker').datepicker({
                container: 'body'
            });
            $('.timepicker').timepicker({
                container: 'body',
                twelveHour: false
            });
        });
        var map;
        var originLat;
        var originLng;
        var destinyLat;
        var place = null;
        var destinyLng;
        var originAddress;
        var destinyAddress;
        var autocomplete;
        var directionsService;
        var originMarker;
        var directionsRenderer;
        var distance;
        var distanceText;
        var duration;
        var durationText;
        var totalTT = 0;
        var totalTV = 0;
        var total = 0;
        var waypts = [];
        var clonwaypts = [];
        var autocompletes = [];
        var inputs = [];
        var idinc = -1;
        $(window).on("load", function() {

            initMap()
            var table = $('#travelsPendingUser').DataTable({
              "language": {
                  "url": '{{asset('public/admin/lang/datatable.json')}}'
              }
            });
            $('.collapsible').collapsible();
            $('select').formSelect();
            $('#origin_now').focus();

            $('#checkGenre').change(function() {
                if ($(this).is(":checked")) {
                    $(this).attr("checked", true);
                    $('#showGenre').removeClass('hide');

                } else {
                    $('#showGenre').addClass('hide');

                    $(this).attr("checked", true);
                }
            });

            $('#checkSchedule').change(function() {
                if ($(this).is(":checked")) {
                    $(this).attr("checked", true);
                    $('#showSchedule').removeClass('hide');

                } else {
                    $('#showSchedule').addClass('hide');

                    $(this).attr("checked", true);
                }
            });

            $('#checkPoster').change(function() {
                if ($(this).is(":checked")) {
                    $(this).attr("checked", true);
                    $('#showPoster').removeClass('hide');
                    $('#poster_name').focus();

                } else {
                    $(this).attr("checked", true);
                    $('#showPoster').addClass('hide');
                }
            });

            $(window).keydown(function(event) {
                if (event.keyCode == 13) {
                    event.preventDefault();
                    return false;
                }
            });

            $('#typetravel').change(function() {

                totalTT = total * $(this).children('option:selected').data('price') - total;

                calculateAndDisplayRoute();

            });

            $('#typevehicle').change(function() {

                totalTV = total * $(this).children('option:selected').data('price') - total;
                calculateAndDisplayRoute();

            });
        });

        function initMap() {

            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer();
            map = new google.maps.Map(document.getElementById('map'), {
                center: {
                    lat: -34.6038158924577,
                    lng: -58.38156236844151
                },
                zoom: 13,
                disableDefaultUI: false
            });

            directionsRenderer.setMap(map);

            origin = document.getElementById('origin_now');

            var options = {
                componentRestrictions: {
                    country: "ar"
                }
            };

            inputs = document.getElementsByClassName('destiny_now');

            autocomplete = new google.maps.places.Autocomplete(origin, options);
            autocomplete.inputId = 'origin_now';
            autocomplete.addListener('place_changed', calculateAndDisplayRoute);


            for (var i = 0; i < inputs.length; i++) {
                autocomplete = new google.maps.places.Autocomplete(inputs[i], options);
                autocomplete.inputId = inputs[i].id;
                autocomplete.addListener('place_changed', calculateAndDisplayRoute);
                autocompletes.push(autocomplete);
            }

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    originLat = position.coords.latitude;
                    originLng = position.coords.longitude;

                    originMarker = new google.maps.Marker({
                        position: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                    });

                    originMarker.setMap(map);

                    map.setCenter(pos);
                }, function() {
                });
            } else {
            }

            var onChangeHandler = function() {
                calculateAndDisplayRoute(directionsService, directionsRenderer);
            };



        }

        function addRow() {
            $("<tr><td><input name='name_passenger[]' required></td><td><input name='lastname_passenger[]' required></td><td><input name='phone_passenger[]' required></td></tr>").hide().appendTo("#passengerRow").slideDown("slow");
        }

        function removeWaypoint(id) {
            waypts.splice(id, 1);
            clonwaypts.splice(id, 1);
            $("#innerInput").empty();
            $("#innerInputValue").empty();
            for (var index = 0; index < clonwaypts.length; index++) {
                console.log(clonwaypts[index]);
                $("<p>" + clonwaypts[index].location + "<a href='#!' class='btn-floating btn-small waves-effect waves-light red' style='margin-left: 5px' onclick='removeWaypoint(" + index + ")'><i class='material-icons'>remove</i></a></p>").hide()
                    .appendTo("#innerInput").slideDown("slow");
                $("<input value='" + clonwaypts[index].location + "' name='waypoint_now[]' type='hidden'/>").hide().appendTo("#innerInputValue").slideDown("slow");
                $("<input value='" + clonwaypts[index].lat + "' name='waypoint_nowlat[]' type='hidden'/>").hide().appendTo("#innerInputValue").slideDown("slow");
                $("<input value='" + clonwaypts[index].lng + "' name='waypoint_nowlng[]' type='hidden'/>").hide().appendTo("#innerInputValue").slideDown("slow");
            }
            calculateAndDisplayRoute();
        }

        function calculateAndDisplayRoute() {

            if (this.inputId == 'waypoint_now') {
                $("#waypoint_now").val('');
                $("#waypoint_now").focus();

                clonwaypts.push({
                    lat: this.getPlace().geometry.location.lat(),
                    lng: this.getPlace().geometry.location.lng(),
                    location: this.getPlace().formatted_address,
                    stopover: true,
                });

                waypts.push({
                    location: this.getPlace().geometry.location.lat() + ',' + this.getPlace().geometry.location.lng(),
                    stopover: true,
                });
                $("#innerInput").empty();
                $("#innerInputValue").empty();
                for (var index = 0; index < clonwaypts.length; index++) {
                    $("<p>" + clonwaypts[index].location + "<a href='#!' class='btn-floating btn-small waves-effect waves-light red' style='margin-left: 5px' onclick='removeWaypoint(" + index + ")'><i class='material-icons'>remove</i></a></p>")
                    .hide().appendTo("#innerInput").slideDown("slow");
                    $("<input value='" + clonwaypts[index].location + "' name='waypoint_now[]' type='hidden'/>").hide().appendTo("#innerInputValue").slideDown("slow");
                    $("<input value='" + clonwaypts[index].lat + "' name='waypoint_nowlat[]' type='hidden'/>").hide().appendTo("#innerInputValue").slideDown("slow");
                    $("<input value='" + clonwaypts[index].lng + "' name='waypoint_nowlng[]' type='hidden'/>").hide().appendTo("#innerInputValue").slideDown("slow");
                }
            }

            if (this.inputId == 'origin_now') {

                originLat = this.getPlace().geometry.location.lat();
                originLng = this.getPlace().geometry.location.lng();
                originMarker = new google.maps.Marker({
                    position: {
                        lat: originLat,
                        lng: originLng
                    },
                });

                var pos = {
                    lat: originLat,
                    lng: originLng
                };
                originMarker.setMap(map);

                map.setCenter(pos);

            }

            if (this.inputId == 'destiny_now') {
                destinyLat = this.getPlace().geometry.location.lat();
                destinyLng = this.getPlace().geometry.location.lng();
            }

            originMarker.setMap(null);

            directionsService.route({
                    origin: {
                        lat: parseFloat(originLat),
                        lng: parseFloat(originLng)
                    },
                    destination: {
                        lat: parseFloat(destinyLat),
                        lng: parseFloat(destinyLng)
                    },
                    waypoints: waypts,
                    optimizeWaypoints: true,
                    travelMode: 'DRIVING'
                },
                function(response, status) {
                    if (status === 'OK') {
                        console.log(response);
                        getLast = response.routes[0].legs.length - 1;
                        directionsRenderer.setDirections(response);
                        distance = 0;

                        $.ajax({
                                type: 'GET', 
                                url: '{{url('calculate/')}}/'+originLat+'/'+originLng+'',
                                dataType: 'json',
                                success: function(data) {
                                    console.log(data);
                                    distance += 0;

                                    for (var i in response.routes[0].legs) {
                                        distance += response.routes[0].legs[i].distance.value;
                                    }

                                    distanceText = response.routes[0].legs[0].distance.text;
                                    duration = response.routes[0].legs[0].duration.value;
                                    durationText = response.routes[0].legs[0].duration.text;
                                    originAddress = response.routes[0].legs[0].start_address;
                                    destinyAddress = response.routes[0].legs[getLast].end_address;

                                    pricesSetting = @json($customer);

                                    prices = @json($customer->pricecustomer()->where('day', $dateDay)->whereRaw('"'.$dateHour.
                                                '" between `start_time` and `end_time`')->get());

                                        convertMT = distance / 1000;

                                        if (convertMT >= {{$customer->limit_km}}) {
                                            pkm = convertMT * {{$customer->price_pkm}};

                                            total = pkm;
                                        } else {
                                            total = {{$customer->price_base}};
                                        }

                                        if (prices) {
                                            prices.forEach(element => {
                                                total = total * element.value_multi;
                                            });
                                        }

                                        if (totalTT != 0) {
                                            total = total + totalTT;
                                        }

                                        if (totalTV != 0) {
                                            total = total + totalTV;
                                        }

                                        $("#origin_addressNow").val(originAddress); $("#destiny_addressNow").val(destinyAddress); $("#origin_latNow").val(originLat); $("#origin_lngNow").val(originLng); $("#destiny_latNow").val(
                                            destinyLat); $("#destiny_lngNow").val(destinyLng); $("#distanceNow").val(distance); $("#totalNow").val(total);

                                        $("#showPrice").empty(); $(
                                            "<div class='card-action green' style='border-bottom-right-radius:10px;border-bottom-left-radius:10px'><div class='row center-align' style='margin-bottom:0'><div class='col s4 '><b class='white-text'>Precio:<br> $" +
                                            parseFloat(total, 10).toFixed(0) + "</b></div><div class='col s4'><b class='white-text'>Distancia:<br> " + parseFloat(distance / 1000, 10).toFixed(1) +
                                            " KM </b></div><div class='col s4'><b class='white-text'>Tiempo de viaje:<br> " + durationText + "</b></div></div></div>").hide().appendTo("#showPrice").slideDown("slow");



                                    }, error: function(data) {
                                        console.log(data);
                                    }
                                });



                        }
                        else {}
                    });

            }
    </script>


    @endpush
