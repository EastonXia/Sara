<!DOCTYPE html>
<html class="dark">
  <head>
    <meta charset="utf-8">
    <title>{{ name }}</title>
    <link rel="stylesheet" href="/static/normalize.css">
    <link rel="icon" href="/static/favicon.png" type="image/x-icon">
  </head>

  <body style="margin: 0;">
    <div id="root"></div>
    <input id="projKey" value="{{ projKey }}" style="display: none;"/>
    <input id="env" value="{{ env }}" style="display: none;"/>
    <input id="options" value="{{ options }}" style="display: none;"/>
  </body>

  <script type="text/javascript">
    try {
      window.projKey = document.getElementById('projKey').value;
      window.env = document.getElementById('env').value; 
      const options = document.getElementById('options').value;
      window.options = JSON.parse(options);
    } catch (e) {
      console.log(e)
    }
  </script>
</html>