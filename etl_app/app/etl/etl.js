'use strict';

angular.module('myApp.etl', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/etl', {
        templateUrl: 'etl/index.html',
        controller: 'etlController'
    });
}])

.controller('etlController', function($scope) {
    $scope.customer = {};
    $scope.customer.header = [];
    $scope.customer.content = [];
    $scope.customer.data = [];
    $scope.headerMap = {};
	$scope.errorDisplay=false;
	//define function to upload csv file, this should be called after we select data and map files
    $scope.upload = function() {
		var affectedRowCount=0;
		$scope.errorDisplay=false;
		//console.log("content ",$scope.customer.content);
		//console.log("header ",$scope.headerMap);
        angular.forEach($scope.customer.content, function(valueObj, keyObj) {
            var tempObj = {};
            angular.forEach(valueObj, function(value, key) {
                tempObj[$scope.headerMap[key]] = value;

            });
			if(Object.keys(tempObj).length===Object.keys($scope.headerMap).length){
				$scope.customer.data.push(tempObj); 
				affectedRowCount++;
			}
			
           	//console.log("data ",$scope.customer.data);
        });
		if(affectedRowCount==0){
			$scope.errorDisplay=true;
		}
		else{
			$scope.customer.content = [];	
			$scope.headerMap={};
		}
       // console.log(" values customer ", $scope.customer.data);
    }
    $scope.showContent = function($fileContent, $type) {
        if ($type == "map") {
            $scope.headerMap = {};
            $scope.customer.header = CSVToArray($fileContent);
            for (var i = 0; i < $scope.customer.header[0].length; i++) {
                $scope.headerMap[$scope.customer.header[1][i]] = $scope.customer.header[0][i];
            }
            //console.log("mapped ", $scope.headerMap);

        } else if ($type == "data") {
          //  console.log("csv toarray data ", CSVToArray($fileContent));
            $scope.dataContent = CSVToArray($fileContent);
            for (var i = 1; i < $scope.dataContent.length; i++) {
                $scope.tempObj = {};
                for (var j = 0; j < $scope.dataContent[i].length; j++) {
                  //  console.log("map map "+$scope.dataContent[0][j]+" and "+$scope.dataContent[i][j]);
                    $scope.tempObj[$scope.dataContent[0][j]] = $scope.dataContent[i][j];
                }
                $scope.customer.content.push($scope.tempObj);
            }
            //console.log("csv data arry after ", $scope.customer.content);

        }




        function CSVToArray(strData, strDelimiter) {
            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");
            // Create a regular expression to parse the CSV values.
            var objPattern = new RegExp(
                (
                    // Delimiters.
                    "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                    // Quoted fields.
                    "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                    // Standard fields.
                    "([^\"\\" + strDelimiter + "\\r\\n]*))"
                ),
                "gi"
            );
            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
                []
            ];
            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null;
            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = objPattern.exec(strData)) {
                // Get the delimiter that was found.
                var strMatchedDelimiter = arrMatches[1];
                // Check to see if the given delimiter has a length
                // (is not the start of string) and if it matches
                // field delimiter. If id does not, then we know
                // that this delimiter is a row delimiter.
                if (
                    strMatchedDelimiter.length &&
                    (strMatchedDelimiter != strDelimiter)
                ) {
                    // Since we have reached a new row of data,
                    // add an empty row to our data array.
                    arrData.push([]);
                }
                // Now that we have our delimiter out of the way,
                // let's check to see which kind of value we
                // captured (quoted or unquoted).
                if (arrMatches[2]) {
                    // We found a quoted value. When we capture
                    // this value, unescape any double quotes.
                    var strMatchedValue = arrMatches[2].replace(
                        new RegExp("\"\"", "g"),
                        "\""
                    );
                } else {
                    // We found a non-quoted value.
                    var strMatchedValue = arrMatches[3];
                }
                // Now that we have our value string, let's add
                // it to the data array.
                arrData[arrData.length - 1].push(strMatchedValue);
            }
            // Return the parsed data.
            return (arrData);
        }




    };

}).directive('onReadFile', function($parse) {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            var fn = $parse(attrs.onReadFile);

            element.on('change', function(onChangeEvent) {
                var reader = new FileReader();

                reader.onload = function(onLoadEvent) {
                    scope.$apply(function() {
                        fn(scope, {
                            $fileContent: onLoadEvent.target.result
                        });
                    });
                };

                reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
            });
        }
    };
});