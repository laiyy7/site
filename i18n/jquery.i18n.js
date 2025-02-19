﻿(function ($) {

  $.i18n = {};

  $.i18n.map = {};

  var debug = function (message) {
      window.console && console.log('i18n::' + message);
  };

  $.i18n.properties = function (settings) {

      var defaults = {
          name: 'Messages',
          language: '',
          path: '',
          namespace: null,
          mode: 'vars',
          cache: false,
          debug: false,
          encoding: 'UTF-8',
          async: false,
          callback: null
      };

      settings = $.extend(defaults, settings);

      if (settings.namespace && typeof settings.namespace == 'string') {
          if (settings.namespace.match(/^[a-z]*$/)) {
              $.i18n.map[settings.namespace] = {};
          } else {
              debug('Namespaces can only be lower case letters, a - z');
              settings.namespace = null;
          }
      }
      if (!settings.path.match(/\/$/)) settings.path += '/';
      settings.language = this.normaliseLanguageCode(settings);
      var files = (settings.name && settings.name.constructor === Array) ? settings.name : [settings.name];
      settings.totalFiles = (files.length * 2) + ((settings.language.length >= 5) ? files.length : 0);
      if (settings.debug) {
          debug('totalFiles: ' + settings.totalFiles);
      }
      settings.filesLoaded = 0;
      files.forEach(function (file) {
          var defaultFileName, shortFileName, longFileName, fileNames;
          defaultFileName = settings.path + file + '.properties';
          var shortCode = settings.language.substring(0, 2);
          shortFileName = settings.path + file + '_' + shortCode + '.properties';
          if (settings.language.length >= 5) {
              var longCode = settings.language.substring(0, 5);
              longFileName = settings.path + file + '_' + longCode + '.properties';
              fileNames = [defaultFileName, shortFileName, longFileName];
          } else {
              fileNames = [defaultFileName, shortFileName];
          }
          loadAndParseFiles(fileNames, settings);
      });
      if (settings.callback && !settings.async) {
          settings.callback();
      }
  };

  $.i18n.prop = function (key) {
      var args = [].slice.call(arguments);
      var phvList, namespace;
      if (args.length == 2) {
          if ($.isArray(args[1])) {
              phvList = args[1];
          } else if (typeof args[1] === 'object') {
              namespace = args[1].namespace;
              var replacements = args[1].replacements;
              args.splice(-1, 1);
              if (replacements) {
                  Array.prototype.push.apply(args, replacements);
              }
          }
      }
      var value = (namespace) ? $.i18n.map[namespace][key] : $.i18n.map[key];
      if (value === null) {
          return '[' + ((namespace) ? namespace + '#' + key : key) + ']';
      }
      var i;
      if (typeof(value) == 'string') {
          i = 0;
          while ((i = value.indexOf('\\', i)) != -1) {
              if (value.charAt(i + 1) == 't') {
                  value = value.substring(0, i) + '\t' + value.substring((i++) + 2); 
              } else if (value.charAt(i + 1) == 'r') {
                  value = value.substring(0, i) + '\r' + value.substring((i++) + 2); 
              } else if (value.charAt(i + 1) == 'n') {
                  value = value.substring(0, i) + '\n' + value.substring((i++) + 2); 
              } else if (value.charAt(i + 1) == 'f') {
                  value = value.substring(0, i) + '\f' + value.substring((i++) + 2); 
              } else if (value.charAt(i + 1) == '\\') {
                  value = value.substring(0, i) + '\\' + value.substring((i++) + 2); 
              } else {
                  value = value.substring(0, i) + value.substring(i + 1); 
              }
          }
          var arr = [], j, index;
          i = 0;
          while (i < value.length) {
              if (value.charAt(i) == '\'') {
                  if (i == value.length - 1) {
                      value = value.substring(0, i);
                  } else if (value.charAt(i + 1) == '\'') {
                      value = value.substring(0, i) + value.substring(++i); 
                  } else {
                      j = i + 2;
                      while ((j = value.indexOf('\'', j)) != -1) {
                          if (j == value.length - 1 || value.charAt(j + 1) != '\'') {
                              value = value.substring(0, i) + value.substring(i + 1, j) + value.substring(j + 1);
                              i = j - 1;
                              break;
                          } else {
                              value = value.substring(0, j) + value.substring(++j);
                          }
                      }

                      if (j == -1) {
                          value = value.substring(0, i) + value.substring(i + 1);
                      }
                  }
              } else if (value.charAt(i) == '{') {
                  j = value.indexOf('}', i + 1);
                  if (j == -1) {
                      i++;
                  } else {
                      index = parseInt(value.substring(i + 1, j));
                      if (!isNaN(index) && index >= 0) {
                          var s = value.substring(0, i);
                          if (s !== "") {
                              arr.push(s);
                          }
                          arr.push(index);
                          i = 0;
                          value = value.substring(j + 1);
                      } else {
                          i = j + 1; 
                      }
                  }
              } else {
                  i++;
              }
          } 
          if (value !== "") {
              arr.push(value);
          }
          value = arr;
          if (namespace) {
              $.i18n.map[settings.namespace][key] = arr;
          } else {
              $.i18n.map[key] = arr;
          }
      }

      if (value.length === 0) {
          return "";
      }
      if (value.length == 1 && typeof(value[0]) == "string") {
          return value[0];
      }

      var str = "";
      for (i = 0, j = value.length; i < j; i++) {
          if (typeof(value[i]) == "string") {
              str += value[i];
          } else if (phvList && value[i] < phvList.length) {
              str += phvList[value[i]];
          } else if (!phvList && value[i] + 1 < args.length) {
              str += args[value[i] + 1];
          } else {
              str += "{" + value[i] + "}";
          }
      }

      return str;
  };

  function callbackIfComplete(settings) {

      if (settings.debug) {
          debug('callbackIfComplete()');
          debug('totalFiles: ' + settings.totalFiles);
          debug('filesLoaded: ' + settings.filesLoaded);
      }

      if (settings.async) {
          if (settings.filesLoaded === settings.totalFiles) {
              if (settings.callback) {
                  settings.callback();
              }
          }
      }
  }

  function loadAndParseFiles(fileNames, settings) {

      if (settings.debug) debug('loadAndParseFiles');

    if (fileNames !== null && fileNames.length > 0) {
      loadAndParseFile(fileNames[0], settings, function () {
        fileNames.shift();
        loadAndParseFiles(fileNames,settings);
      });
    } else {
          callbackIfComplete(settings);
      }
  }

  function loadAndParseFile(filename, settings, nextFile) {

      if (settings.debug) {
          debug('loadAndParseFile(\'' + filename +'\')');
          debug('totalFiles: ' + settings.totalFiles);
          debug('filesLoaded: ' + settings.filesLoaded);
      }

      if (filename !== null && typeof filename !== 'undefined') {
          $.ajax({
              url: filename,
              async: settings.async,
              cache: settings.cache,
              dataType: 'text',
              success: function (data, status) {

                  if (settings.debug) {
                      debug('Succeeded in downloading ' + filename + '.');
                      debug(data);
                  }

                  parseData(data, settings);
                  nextFile();
              },
              error: function (jqXHR, textStatus, errorThrown) {

                  if (settings.debug) {
                      debug('Failed to download or parse ' + filename + '. errorThrown: ' + errorThrown);
                  }
                  if (jqXHR.status === 404) {
                      settings.totalFiles -= 1;
                  }
                  nextFile();
              }
          });
      }
  }
  function parseData(data, settings) {
      var parsed = '';
      var lines = data.split(/\n/);
      var regPlaceHolder = /(\{\d+})/g;
      var regRepPlaceHolder = /\{(\d+)}/g;
      var unicodeRE = /(\\u.{4})/ig;
      for (var i=0,j=lines.length;i<j;i++) {
          var line = lines[i];
          line = line.trim();
          if (line.length > 0 && line.match("^#") != "#") { // skip comments
              var pair = line.split('=');
              if (pair.length > 0) {
                  var name = decodeURI(pair[0]).trim();
                  var value = pair.length == 1 ? "" : pair[1];
                  while (value.search(/\\$/) != -1) {
                      value = value.substring(0, value.length - 1);
                      value += lines[++i].trimRight();
                  }
                  for (var s = 2; s < pair.length; s++) {
                      value += '=' + pair[s];
                  }
                  value = value.trim();
                  if (settings.mode == 'map' || settings.mode == 'both') {
                      var unicodeMatches = value.match(unicodeRE);
                      if (unicodeMatches) {
                          unicodeMatches.forEach(function (match) {
                              value = value.replace(match, unescapeUnicode(match));
                          });
                      }
                      if (settings.namespace) {
                          $.i18n.map[settings.namespace][name] = value;
                      } else {
                          $.i18n.map[name] = value;
                      }
                  }
                  if (settings.mode == 'vars' || settings.mode == 'both') {
                      value = value.replace(/"/g, '\\"');
                      checkKeyNamespace(name);
                      if (regPlaceHolder.test(value)) {
                          var parts = value.split(regPlaceHolder);
                          var first = true;
                          var fnArgs = '';
                          var usedArgs = [];
                          parts.forEach(function (part) {

                              if (regPlaceHolder.test(part) && (usedArgs.length === 0 || usedArgs.indexOf(part) == -1)) {
                                  if (!first) {
                                      fnArgs += ',';
                                  }
                                  fnArgs += part.replace(regRepPlaceHolder, 'v$1');
                                  usedArgs.push(part);
                                  first = false;
                              }
                          });
                          parsed += name + '=function(' + fnArgs + '){';
                          var fnExpr = '"' + value.replace(regRepPlaceHolder, '"+v$1+"') + '"';
                          parsed += 'return ' + fnExpr + ';' + '};';
                      } else {
                          parsed += name + '="' + value + '";';
                      }
                  } 
              } 
          } 
      }
      eval(parsed);
      settings.filesLoaded += 1;
  }
  function checkKeyNamespace(key) {

      var regDot = /\./;
      if (regDot.test(key)) {
          var fullname = '';
          var names = key.split(/\./);
          for (var i=0,j=names.length;i<j;i++) {
              var name = names[i];

              if (i > 0) {
                  fullname += '.';
              }

              fullname += name;
              if (eval('typeof ' + fullname + ' == "undefined"')) {
                  eval(fullname + '={};');
              }
          }
      }
  }
  $.i18n.normaliseLanguageCode = function (settings) {

      var lang = settings.language;
      if (!lang || lang.length < 2) {
          if (settings.debug) debug('No language supplied. Pulling it from the browser ...');
          lang = (navigator.languages && navigator.languages.length > 0) ? navigator.languages[0]
                                      : (navigator.language || navigator.userLanguage /* IE */ || 'en');
          if (settings.debug) debug('Language from browser: ' + lang);
      }

      lang = lang.toLowerCase();
      lang = lang.replace(/-/,"_");
      if (lang.length > 3) {
          lang = lang.substring(0, 3) + lang.substring(3).toUpperCase();
      }
      return lang;
  };
  function unescapeUnicode(str) {
      var codes = [];
      var code = parseInt(str.substr(2), 16);
      if (code >= 0 && code < Math.pow(2, 16)) {
          codes.push(code);
      }
      return codes.reduce(function (acc, val) { return acc + String.fromCharCode(val); }, '');
  }
}) (jQuery);
