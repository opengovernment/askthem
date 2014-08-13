(function() {
  // Globals for tracking instances of widget
  // i.e. there may be more than one on the page, each called with different params
  if (!window.AskThemQuestionWidget) { window.AskThemQuestionWidget = {}; };
  var AskThemQuestionWidget = window.AskThemQuestionWidget;

  // To keep track of which embeds we have already processed
  if (!AskThemQuestionWidget.foundEmbeds) AskThemQuestionWidget.foundEmbeds = [];
  var foundEmbeds = AskThemQuestionWidget.foundEmbeds;

  // Localize jQuery variable
  var jQuery;

  /******** Load jQuery if not present *********/
  if (window.jQuery === undefined || window.jQuery.fn.jquery !== '2.1.1') {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
                            "http://code.jquery.com/jquery-2.1.1.min.js");
    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
        if (this.readyState === 'complete' || this.readyState === 'loaded') {
          scriptLoadHandler();
        }
      };
    } else { // Other browsers
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
  } else {
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
  }

  /******** Called once jQuery has loaded ******/
  function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main();
  }

  function htmlTemplate(tagId, headline, questionSummary) {
    var html = '<div class="at-widget" id="' + tagId + '">';
    html += '<h4>' + headline + '</h4>';
    html += '<div class="description"><p>' + questionSummary + '</p></div>';
    html += '\
    <form action="http://www.askthem.io/locator">\
      <fieldset>\
        <input type="text" name="q" class="zip" placeholder="Zip Code">\
        <div class="button">\
          <div class="sign">\
            <span class="question"></span>\
            <span class="ptext"></span>\
          </div>\
        </div>\
        <input type="submit" style="display: none;" value="">\
      </fieldset>\
    </form>';
    html += '</div>';

    return html;
  }

  /******** Our main function ********/
  function main() {
    jQuery(document).ready(function($) {
      // We can use jQuery here

      // load css, only if it hasn't been loaded
      if (!jQuery("link[href='//www.askthem.io/widgets/zip/widget.css']").length) {
        var cssLink = jQuery("<link>", {
          rel: "stylesheet",
          type: "text/css",
          href: "//www.askthem.io/widgets/zip/widget.css"
        });

        cssLink.appendTo('head');
      }

      jQuery('.at-widget-loader').each(function(i) {
        if (foundEmbeds.indexOf(this) < 0) {
          // parse our parameters
          // set defaults, use data attributes where possible
          // hidden divs where we need html
          var tagId = 'at-question-' + i.toString();
          if (jQuery(this).data('tag-id').length > 0) tagId = jQuery(this).data('tag-id');

          var tagIdSelector = "#"+tagId;

          var paramsDiv;
          jQuery('div.at-widget-attributes').each(function () {
            var associatedTagId = jQuery(this).data('tag-id');
            if (typeof associatedTagId !== "undefined" && associatedTagId === tagId) {
              paramsDiv = this;
            }
          })

          var headline = 'ASK POLITICIANS THIS QUESTION!';
          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.headline').length > 0) headline = jQuery(paramsDiv).find('.headline').html();
          } else if (typeof jQuery(this).data('headline') !== "undefined") {
            headline = jQuery(this).data('headline');
          }

          var questionSummary = 'Will you state: "I approve <b>the truth</b> of this message" in your political ads?  Why or why not?';
          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.question-summary').length > 0) questionSummary = jQuery(paramsDiv).find('.question-summary').html();
          } else if (typeof jQuery(this).data('question-summary') !== "undefined") {
            questionSummary = jQuery(this).data('question-summary');
          }

          var questionBody = '';
          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.question-body').length > 0) questionBody = jQuery(paramsDiv).find('.question-body').html();
          } else if (typeof jQuery(this).data('question-body') !== "undefined") {
            questionBody = jQuery(this).data('question-body');
          }

          // add our HTML
          jQuery(this).after(htmlTemplate(tagId, headline, questionSummary));

          // register click handling for button div
          var widgetContainer = jQuery(tagIdSelector);
          jQuery(widgetContainer).find('.button').click(function() {
            jQuery(widgetContainer).children('form').submit();
          })

          foundEmbeds.push(this);
        }
      })
    });
  }

})(); // We call our anonymous function immediately
