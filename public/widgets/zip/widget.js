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

  function htmlTemplate(tagId, options) {
    headline = options.headline;
    summary = options.questionSummary;
    body = options.questionBody;
    name = options.partner.name;
    url = options.partner.url;
    logo = options.partner.logo;

    var html = '<div class="at-widget" id="' + tagId + '">';
    html += '<h4>' + headline + '</h4>';
    html += '<div class="description"><p>' + summary + '</p></div>';
    html += '\
    <form action="http://www.askthem.io/locator" method="post">\
      <fieldset>\
        <input type="hidden" name="only_show" value="people">\
        <input type="hidden" name="question[title]" value="' + summary.replace(/"/g, '&quot;') + '">';
    html += '\
        <input type="hidden" name="question[body]" value="' + body.replace(/"/g, '&quot;') + '">';
    html += '\
        <input type="hidden" name="partner[name]" value="' + name + '">';
    html += '\
        <input type="hidden" name="partner[url]" value="' + url + '">';
    html += '\
        <input type="hidden" name="partner[logo]" value="' + logo + '">';
    html += '\
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
          if (jQuery(this).data('tag-id') && jQuery(this).data('tag-id').length > 0) tagId = jQuery(this).data('tag-id');

          var tagIdSelector = "#"+tagId;

          var paramsDiv;
          jQuery('div.at-widget-attributes').each(function () {
            var associatedTagId = jQuery(this).data('tag-id');
            if (typeof associatedTagId !== "undefined" && associatedTagId === tagId) {
              paramsDiv = this;
            }
          })

          var partnerName = "HonestAds";
          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.partner-name').length > 0) partnerName = jQuery(paramsDiv).find('.partner-name').html();
          } else if (typeof jQuery(this).data('partner-name') !== "undefined") {
            partnerName = jQuery(this).data('partner-name');
          }

          /* adjust defaults based on partner */
          var partnerUrl = "";
          if(partnerName === 'HonestAds') {
            partnerUrl = "http://honestads.org/";
          }

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.partner-url').length > 0) partnerUrl = jQuery(paramsDiv).find('.partner-url').html();
          } else if (typeof jQuery(this).data('partner-url') !== "undefined") {
            partnerUrl = jQuery(this).data('partner-url');
          }

          var partnerLogo = '';
          if(partnerName === 'HonestAds') {
            partnerLogo = '//www.askthem.io/widgets/zip/honestads2.png';
          }

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.partner-logo').length > 0) partnerLogo = jQuery(paramsDiv).find('.partner-logo').html();
          } else if (typeof jQuery(this).data('partner-logo') !== "undefined") {
            partnerLogo = jQuery(this).data('partner-logo');
          }

          var headline = '';
          if(partnerName === 'HonestAds') {
            headline = 'ASK POLITICIANS THIS QUESTION!';
          }

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.headline').length > 0) headline = jQuery(paramsDiv).find('.headline').html();
          } else if (typeof jQuery(this).data('headline') !== "undefined") {
            headline = jQuery(this).data('headline');
          }

          var questionSummary = '';
          if(partnerName === 'HonestAds') {
            questionSummary = 'Will you state "I approve the <b>truth</b> of this message" in your political ads?';
          }

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.question-summary').length > 0) questionSummary = jQuery(paramsDiv).find('.question-summary').html();
          } else if (typeof jQuery(this).data('question-summary') !== "undefined") {
            questionSummary = jQuery(this).data('question-summary');
          }

          var questionBody = '';
          if(partnerName === 'HonestAds') {
            questionBody = 'Just stating "I approve this message" doesn\'t mean your ad is true. If you want my support, I need the truth. #HonestAdsorg';
          }

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.question-body').length > 0) questionBody = jQuery(paramsDiv).find('.question-body').html();
          } else if (typeof jQuery(this).data('question-body') !== "undefined") {
            questionBody = jQuery(this).data('question-body');
          }

          var options = {
            headline: headline,
            questionSummary: questionSummary,
            questionBody: questionBody,
            partner: {
              name: partnerName,
              url: partnerUrl,
              logo: partnerLogo
            }
          };

          // add our HTML
          jQuery(this).after(htmlTemplate(tagId, options));

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
