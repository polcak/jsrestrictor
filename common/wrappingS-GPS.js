(function() {
	var wrappers = [
		{
			parent_object: "navigator",
			parent_object_property: "geolocation",
			wrapped_objects: [],
			post_wrapping_code: [
				{
					code_type: "object_properties",
					parent_object: "navigator",
					parent_object_property: "geolocation",
					wrapped_objects: [],
				}
			],
    },
		{
			parent_object: "navigator.geolocation",
			parent_object_property: "getCurrentPosition",
			wrapped_objects: [
				{
					original_name: "navigator.geolocation.getCurrentPosition",
					wrapped_name: "origGetCurrentPosition",
				}
			],
			helping_code: rounding_function + noise_function,
			wrapping_function_args: "selectOption, latitudePrecision, longitudePrecision, altitudePrecision, accuracyPrecision, altitudePrecision, headingPrecision, speedPrecision, timestampPrecision",
      wrapping_function_body: `
        var setAllGPSDataToZero = false;
        if (selectOption == "b") {
            setAllGPSDataToZero = true;
        }
        
        var latitudePrecision = " + latitudePrecision + ";
        
        var originalGetCurrentPositionFunction = navigator.geolocation.getCurrentPosition;
        navigator.geolocation.getCurrentPosition = function(functionName) {
        
          originalGetCurrentPositionFunction.call(navigator.geolocation, processOriginalGPSDataObject);
        
          function processOriginalGPSDataObject(originalPositionObject) {
            var newLatitude = 0;
            var newLongitude = 0;
            var newAltitude = 0;
            var newAccuracy = 0;
            var newAltitudeAccuracy = 0;
            var newHeading = 0;
            var newSpeed = 0;
            var newTimestamp = 0;
        
            if (!setAllGPSDataToZero) {
              if (originalPositionObject.coords.latitude != null && originalPositionObject.coords.latitude != Infinity && originalPositionObject.coords.latitude >= 0) {
                  newLatitude = rounding_function(originalPositionObject.coords.latitude, latitudePrecision);
              }
              if (originalPositionObject.coords.longitude != null && originalPositionObject.coords.longitude != Infinity && originalPositionObject.coords.longitude >= 0) {
                newLongitude = rounding_function(originalPositionObject.coords.longitude, longitudePrecision);
              }
              if (originalPositionObject.coords.altitude != null && originalPositionObject.coords.altitude != Infinity && originalPositionObject.coords.altitude >= 0) {
                newAltitude = rounding_function(originalPositionObject.coords.altitude, altitudePrecision);
              }
              if (originalPositionObject.coords.accuracy != null && originalPositionObject.coords.accuracy != Infinity && originalPositionObject.coords.accuracy >= 0) {
                newAccuracy = rounding_function(originalPositionObject.coords.accuracy, accuracyPrecision);
              }
              if (originalPositionObject.coords.altitudeAccuracy != null && originalPositionObject.coords.altitudeAccuracy != Infinity && originalPositionObject.coords.altitudeAccuracy >= 0) {
                newAltitudeAccuracy = rounding_function(originalPositionObject.coords.altitudeAccuracy, altitudeAccuracyPrecision);
              }
              if (originalPositionObject.coords.heading != null && originalPositionObject.coords.heading != Infinity && originalPositionObject.coords.heading >= 0) {
                newHeading = rounding_function(originalPositionObject.coords.heading, headingPrecision);
              }
              if (originalPositionObject.coords.speed != null && originalPositionObject.coords.speed != Infinity && originalPositionObject.coords.speed >= 0) {
                newSpeed = rounding_function(originalPositionObject.coords.speed, speedPrecision);
              }
              if (originalPositionObject.timestamp != null && originalPositionObject.timestamp != Infinity && originalPositionObject.timestamp >= 0) {
                newTimestamp = rounding_function(originalPositionObject.timestamp, timestampPrecision);
              }
            }
        
            const editedPositionObject = {
              coords: {
                latitude: newLatitude,
                longitude: newLongitude,
                altitude: newAltitude,
                accuracy: newAccuracy,
                altitudeAccuracy: newAltitudeAccuracy,
                heading: newHeading,
                speed: newSpeed,
                __proto__: originalPositionObject.coords.__proto__
              },
              timestamp: newTimestamp,
              __proto__: originalPositionObject.__proto__
            };
        
            functionName.call(this, editedPositionObject);
            return true;
          }
          return undefined;
        };
        
        function rounding_function(numberToRound, precision) {
          var moveDecimalDot = Math.pow(10, precision);
          return Math.round(numberToRound * moveDecimalDot) / moveDecimalDot;
        }
        }) ();  
			`,
		},
		{
			parent_object: "navigator.geolocation",
      parent_object_property: "getCurrentPosition",
            
			wrapped_objects: [
				{
					original_name: "getCurrentPosition",
					wrapped_name: "originalGetCurrentPosition",
				},
			],
			helping_code: "",
			wrapping_function_args: "showCallBack",
      wrapping_function_body: `
        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        }

        var options = {
        enableHighAccuracy: false,
        timeout: 5000
        };

        originalGetCurrentPosition(showCallBack, error, options);
      `,
    },
		{
			parent_object: "navigator.geolocation",
			parent_object_property: "watchPosition",
			wrapped_objects: [
				{
					original_name: "watchPosition",
					wrapped_name: "originalWatchPosition",
				},
			],
			helping_code: "",
			wrapping_function_args: "successCallBack",
      wrapping_function_body: `
        function error(err) {
            console.warn('ERROR(' + err.code + '): ' + err.message);
        }

        var options = {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 0
        };

        return originalWatchPosition(successCallBack, error, options);
			`,
    },
		{
			parent_object: "navigator.geolocation",
			parent_object_property: "clearWatch",
			wrapped_objects: [
				{
					original_name: "clearWatch",
					wrapped_name: "originalClearWatch",
				},
			],
			helping_code: "",
			wrapping_function_args: "id",
      wrapping_function_body: `
        originalClearWatch(id);
      `,
		}
	]
	add_wrappers(wrappers);
})();