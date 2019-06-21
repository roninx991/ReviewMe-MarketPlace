$(document).ready(function(){	
	$("#btn-signup").click(function(){
		const url = "/register";

		var register_data = {
			Oname: $("#organisationName").val(),
			email: $("#Email").val(),
			pwd: $("#Password").val(),
			type: "1",
		}
		
		if(validate(register_data)){
			if(register_data.pwd != $("#rPassword").val()){
				alert("Password doesn't match");
				// return false;
			}
			$.post(url, register_data, function(res, status){
				if(res.code == "error"){
					console.log(res.msg);
					swal('Aww snap!', res.msg, res.code);
				}
				else{
					console.log(res.msg);
					swal('Thank You!', res.msg, res.code);
				}
				clear_form();
			});
		}
	});


	function validate(register_data) {
		if(register_data.Oname === ""){
			swal("Missing Details", "Please fill first name field", "error");
			return false;
		}
		if(register_data.email === ""){
			swal("Missing Details", "Please fill email field", "error");
			return false;
		}
		if(register_data.pwd === ""){
			swal("Missing Details", "Please fill password field", "error");
			return false;
		}
		if($("#rPassword").val() === ""){
			swal("Missing Details", "Please fill retype password field", "error");
			return false;
		}
		return true;
	}
	
	function clear_form() {
		$("#organisationName").val('');
		$("#Email").val('');
		$("#Password").val('');
		$("#rPassword").val('');		
	}

});

