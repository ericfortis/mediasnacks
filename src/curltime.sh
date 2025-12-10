#!/bin/sh

# https://stackoverflow.com/a/47944496

curl -so /dev/null -w "\
   DNS Lookup  %{time_namelookup}
TCP Handshake  %{time_connect}
TLS Handshake  %{time_appconnect}
         Wait  %{time_pretransfer}
     Redirect  %{time_redirect}
   First Byte  %{time_starttransfer}
───────────────────────   
        TOTAL  %{time_total}
" "$@"
