(function() {
  // Globals for tracking instances of widget
  // i.e. there may be more than one on the page, each called with different params
  if (!window.AskThemAddressWidget) { window.AskThemAddressWidget = {}; };
  var AskThemAddressWidget = window.AskThemAddressWidget;

  // To keep track of which embeds we have already processed
  if (!AskThemAddressWidget.foundEmbeds) AskThemAddressWidget.foundEmbeds = [];
  var foundEmbeds = AskThemAddressWidget.foundEmbeds;

  // Localize jQuery variable
  var jQuery;

  /******** Load jQuery if not present *********/
  if (window.jQuery === undefined || window.jQuery.fn.jquery !== '2.1.3') {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
                            "http://code.jquery.com/jquery-2.1.3.min.js");
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

  function htmlTemplate(tagId) {
    var html = '<div class="at-widget">';
    html += '<div id="' + tagId + '-container"></div>';
    html += '</div>';

    return html;
  }

  function addMetaTags(tagId, options) {
    this._createMetaTag = function(name, content) {
      var metaTag = jQuery("<meta>", {
        name: name,
        content: content
      });

      metaTag.appendTo('head');
    }

    this._isNested = function(value) {
      return value === Object(value);
    }

    this._createMetaTagsFrom = function(namePath, value) {
      for (var property in value) {
        if (value.hasOwnProperty(property)) {
          var subValue = value[property];

          if (_isNested(subValue)) {
            _createMetaTagsFrom(namePath + property + '/', subValue);
          } else {
            _createMetaTag(namePath + property, subValue);
          }
        }
      }
    }

    // needed to set up our instance of an ember app
    _createMetaTag(tagId + '/config/environment',
                   '%7B%22modulePrefix%22%3A%22' + tagId + '%22%2C%22environment%22%3A%22production%22%2C%22locationType%22%3A%22none%22%2C%22contentSecurityPolicy%22%3A%7B%22default-src%22%3A%22%27none%27%22%2C%22script-src%22%3A%22%27self%27%20http%3A//ember.dev%3A35729/%22%2C%22font-src%22%3A%22%27self%27%20http%3A//www.askthem.io/%22%2C%22connect-src%22%3A%22%27self%27%20http%3A//www.askthem.io/%20http%3A//askthem.dev/%20ws%3A//ember.dev%3A35729/%22%2C%22img-src%22%3A%22%27self%27%20http%3A//i.embed.ly/%20http%3A//www.askthem.io/%20http%3A//askthem.dev/%22%2C%22style-src%22%3A%22%27self%27%22%2C%22media-src%22%3A%22%27self%27%22%7D%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%22ember-htmlbars%22%3Atrue%7D%7D%2C%22APP%22%3A%7B%22rootElement%22%3A%22%23' + tagId + '-container%22%2C%22askThemHost%22%3A%22www.askthem.io%22%2C%22name%22%3A%22' + tagId + '%22%2C%22version%22%3A%220.0.0.fdbcefdc%22%7D%2C%22optionsConfig%22%3A%7B%7D%2C%22ember-apijax%22%3A%7B%22host%22%3A%22http%3A//www.askthem.io%22%7D%2C%22contentSecurityPolicyHeader%22%3A%22Content-Security-Policy-Report-Only%22%2C%22exportApplicationGlobal%22%3Afalse%7D')

    // add meta tags for each of our options, namespaced to our tagId
    // they will be read by our application and set app vars
    var initializerPath = tagId + '/initializers/options/';

    _createMetaTagsFrom(initializerPath, options);
  }


  function appFromConcoction(tagId) {
    // TODO: make sure that tagId is valid for our needs
    var appConcoction;

    // in dev, loading fails in chrome with security issue, due to CORs no in pow
    // No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'null' is therefore not allowed access.
    jQuery.get('http://www.askthem.io/widgets/address/app-concoction.txt', function(data) {
      appConcoction = data;

      // var appCode = appConcoction.replace(/\\/g, '\\');
      // appCode.replace(/PREFIX_PATTERN/g, tagId);

      var appCode = appConcoction.replace(/PREFIX_PATTERN/g, tagId);

      (function poll() {
        setTimeout( function() {
          if (AskThemAddressWidget.jsNecessaryToComplete === 0) {
            eval(appCode);
          } else {
            poll();
          }
        }, 100);
      })();

    }, 'text')
  }

  function addJSIfNecessary(jsUrls) {
    jQuery.each(jsUrls, function(key, value) {
      AskThemAddressWidget.jsNecessaryToComplete++;

      jQuery.ajax({
        url: value,
        dataType: "script",
        cache: true
      }).done(function() {
        AskThemAddressWidget.jsNecessaryToComplete--;
      });
    });
  }

  function addCssLinksIfNecessary(cssUrls) {
    jQuery.each(cssUrls, function(key, value) {
      var cssSelector = "link[href='"+ value + "']";

      if (!jQuery(cssSelector).length) {
        var cssLink = jQuery("<link>", {
          rel: "stylesheet",
          type: "text/css",
          href: value
        });

        cssLink.appendTo('head');
      }
    });
  }

  /******** Our main function ********/
  function main() {
    jQuery(document).ready(function($) {
      // We can use jQuery here

      // load css, only if it hasn't been loaded
      var cssUrls = ['http://www.askthem.io/widgets/address/assets/vendor-ba26407e909fb4a64f1f0a2ade32443c.css',
                     'http://www.askthem.io/widgets/address/assets/address-widget-de334b446de5592c226959939e10fd3c.css'];

      addCssLinksIfNecessary(cssUrls);

      var jsUrls = ['http://www.askthem.io/widgets/address/assets/vendor-14893c922328afae99c18b2576cbb03d.js'];

      // track if all our scripts have loaded globally
      // we increment and decrement within addJSIfNecessary
      if (!AskThemAddressWidget.jsNecessaryToComplete) AskThemAddressWidget.jsNecessaryToComplete = 0;

      addJSIfNecessary(jsUrls);

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

          var partnerName = "";
          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.partner-name').length > 0) partnerName = jQuery(paramsDiv).find('.partner-name').html();
          } else if (typeof jQuery(this).data('partner-name') !== "undefined") {
            partnerName = jQuery(this).data('partner-name');
          }

          /* adjust defaults based on partner */
          var partnerUrl = "";

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.partner-url').length > 0) partnerUrl = jQuery(paramsDiv).find('.partner-url').html();
          } else if (typeof jQuery(this).data('partner-url') !== "undefined") {
            partnerUrl = jQuery(this).data('partner-url');
          }

          var partnerLogo = '';

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.partner-logo').length > 0) partnerLogo = jQuery(paramsDiv).find('.partner-logo').html();
          } else if (typeof jQuery(this).data('partner-logo') !== "undefined") {
            partnerLogo = jQuery(this).data('partner-logo');
          }

          var headline = '';

          if(paramsDiv) {
            if (jQuery(paramsDiv).find('.headline').length > 0) headline = jQuery(paramsDiv).find('.headline').html();
          } else if (typeof jQuery(this).data('headline') !== "undefined") {
            headline = jQuery(this).data('headline');
          }

          var questionSummary = '';

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

          var options = {
            headline: headline,
            question: {
              summary: questionSummary,
              body: questionBody
            },
            partner: {
              name: partnerName,
              url: partnerUrl,
              logo: partnerLogo
            }
          };

          // add our HTML (including meta tags)
          addMetaTags(tagId, options);

          jQuery(this).after(htmlTemplate(tagId));

          // set up our instance of Ember with its custom namespace
          // based on a concoction (sort of like a template for entire app)
          appFromConcoction(tagId);

          foundEmbeds.push(this);
        }
      })
    });
  }
})(); // We call our anonymous function immediately
