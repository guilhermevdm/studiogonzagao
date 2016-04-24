$(function () {
	$(".alert .close").click(function() {
	   $(this).parent().slideUp(function () {
	     $(this).remove();
	   });
	});
});