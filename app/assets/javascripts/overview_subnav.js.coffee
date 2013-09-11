maxHeight = -1
$(".radio_nav a").each ->
  maxHeight = (if maxHeight > $(this).height() then maxHeight else $(this).height())

$(".radio_nav a").each ->
  $(this).height maxHeight
