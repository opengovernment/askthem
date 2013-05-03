togglePeopleSelect = (elem) ->
  console.log elem
  if $(elem).children('div.select_box').children("input:radio").prop("checked") is false
    $(elem).siblings("li").removeClass("selected").addClass "deselected"
    $(elem).children('div.select_box').children("input:radio").prop "checked", true
    $(elem).addClass("selected").removeClass "deselected"
  else
    console.log 'hrm'
$ ->
  $(".people-list.select-person li").click ->
    togglePeopleSelect this