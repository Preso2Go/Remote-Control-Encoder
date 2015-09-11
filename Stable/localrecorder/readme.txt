- You need at least Presentations 2Go encoder version 4.0.5725 for this to work.
- Past the html code into the application root (not in a separate sub folder)
- allow incoming trafic over port 80 in your firewall on the encoder pc
- open a dos prompt on your encoder PC AS ADMIN and run: netsh http add urlacl url=http://+:80/ user=Everyone
(replace Everyone by the local alternative in case you are not running UK windows)


