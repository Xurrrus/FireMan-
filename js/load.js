
var load_obj = function(){
	var vue_instance = new Vue({
		el: "#saves_id",
		data: {
			saves: []
		},
		created: function(){
			let arrayPartides = [];
			if(localStorage.sav2){
				arrayPartides = JSON.parse(localStorage.sav2);
				if(!Array.isArray(arrayPartides)) arrayPartides = [];
			}
			this.saves = arrayPartides;
		},
		methods: { 
			load: function(i){
				sessionStorage.idPartida = i;
				loadpage("../html/platform.html");
			}
		}
	});
	return {}; 
}();