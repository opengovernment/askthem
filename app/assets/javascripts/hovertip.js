$('.people .depiction').hover(function(){
    $(this).children('.hover-tip').addClass('is-showing');
},function(){
    $(this).children('.hover-tip').removeClass('is-showing');
});
