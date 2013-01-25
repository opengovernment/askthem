# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

###
	Ask a question flow
###

hasValue = (element) ->
	if $((element)).val()
		$(element).addClass 'hasValue'
	else
		$(element).removeClass 'hasValue'

	

$(document).ready ->
	$('#summary').focus()
	$('textarea').css('overflow', 'hidden').autogrow()
	
	$('#summary').keyup ->
		str = $(this).val()
		strlength = str.length
		if strlength >= 60
			$(this).val str.substring(0, str.length - 1)
	
	$('input[type=text], textarea').blur ->
		hasValue(this)