#!/bin/bash
# =============================================================================
# AUDIT SCRIPT TO VERIFY THE INTEGRITY OF THE BUNDLED RESOURCES
#
# Author        nobody
# Versions      1.2
#
# License       MPL 2.0
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this file,
# You can obtain one at http://mozilla.org/MPL/2.0/.
#
# =============================================================================
# PREREQUISITES:
#
# - Bash >= 4.4
# - LocalCDN >= v2.6.3
# - Local Tor SOCKS5 Proxy (optional, but recommended)
#
# =============================================================================
# SETTINGS:
#
# Use local Tor Proxy
# USE_TOR=false   #fast (~ 4 minutes)
USE_TOR=true    #slow (~ 15 minutes)
#
# Set this value to "true" to generate the THIRD_PARTY.txt file.
# This file contains all source URLs that were used for the check.
# CREATE_THIRD_PARTY_FILE=true
CREATE_THIRD_PARTY_FILE=false
#
# =============================================================================
# INSTALL TOR PROXY:
# - sudo apt install tor
#   e.g. https://linuxconfig.org/install-tor-proxy-on-ubuntu-20-04-linux
#
# CHECK TOR:
# - systemctl status tor@default.service
# - systemctl status tor.service
#
# =============================================================================
# HOW TO START:
#
# A) Check all files:
#      bash audit.sh
#
# B) Check only one library:
#    Choose the folder name from /resources/, e.g. jquery
#      bash audit.sh jquery
#
# C) Check all files and replace in case of hash mismatch:
#      bash audit.sh replace
#
# D) Check only one library files and replace in case of hash mismatch:
#    Choose the folder name from /resources/, e.g. jquery
#      bash audit.sh replace jquery
#
# =============================================================================
# WHICH FILES WILL BE CHECKED?
#
# All files in the directory /resources/
#
# Exceptions:
#   /resources/*/note
#   /resources/google-material-design-icons/google-material-design-icons.css

# =============================================================================
# CDNs
# =============================================================================
CLOUDFLARE="https://cdnjs.cloudflare.com/ajax/libs"
CLOUDFLARE_AJAX="https://ajax.cloudflare.com/cdn-cgi/scripts"
JSDELIVR="https://cdn.jsdelivr.net"
GITHUB="https://raw.githubusercontent.com"

# =============================================================================
# GLOBALS
# =============================================================================
REGEX_JS=".*\.jsm$"
COUNTER_ALL=0
COUNTER_HASH_FAILED=0
COUNTER_CONNECT_FAILED=0
COUNTER_HASH_OK=0
COUNTER_SKIPPED=0
LOCAL_HASH=""
REMOTE_HASH=""
REPLACE=false
FILES_FAILED=""
FILES_SKIPPED=""
FILES_NO_CONNECTION=""

# =============================================================================
# FORMATTING
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NOCOLOR='\033[0m'
BOLD=$(tput bold)
NORMAL=$(tput sgr0)
DIVIDER=$(printf '%*s\n' 141 '' | tr ' ' "=")

# =============================================================================
# ARGUMENTS HANDLING
# =============================================================================
if [ "$1" = "replace" ] && [ "$2" = "" ]; then
    REPLACE=true
    CHECK="ALL"
    echo -e "CHECK:   ALL"
    echo -e "REPLACE: YES"
elif [ "$1" != "" ] && [ "$1" != "replace" ]; then
    CHECK=$1
    echo -e "CHECK:   $1"
    echo -e "REPLACE: NO"
elif [ "$1" = "replace" ] && [ "$2" != "" ]; then
    REPLACE=true
    CHECK=$2
    echo -e "CHECK:   $2"
    echo -e "REPLACE: YES"
else
    CHECK="ALL"
    echo -e "CHECK:   ALL"
    echo -e "REPLACE: NO"
fi

if [[ "$USE_TOR" != true && "$USE_TOR" != false ]]; then
    echo -e "USE_TOR not set. Please select yes (true) or no (false)!"
    exit 1
fi

# =============================================================================
# CHECK RESOURCE
# =============================================================================
function check_resource
{
    path=$1
    folder=$(echo -e "$path" | cut -d"/" -f3)

    if [ "$CHECK" != "ALL" ] && [ "$CHECK" != "$folder" ]; then
        return 0
    fi

    ((COUNTER_ALL++))
    echo -e "$DIVIDER"
    echo -e "SCANNED:     ${COUNTER_ALL}/${#array[@]}"
    echo -e "PATH:        $i"

    version=$(echo -e "$path" | cut -d"/" -f4)
    file=$(echo -e "$path" | cut -d"/" -f5)
    subfile=$(echo -e "$path" | awk -F"/" '{print $NF}')
    jfile=$file
    url=""
    is_javascript=false
    error=false

    if [[ $path =~ $REGEX_JS ]]; then
        path=$(echo "$path" | sed 's/.$//')
        jfile=$(echo "$file" | sed 's/.$//')
        subfile=$(echo "$subfile" | sed 's/.$//')
        is_javascript=true
    fi

    # Get URL of CDN
    create_url

    # Use Tor Proxy if set
    if [ "$USE_TOR" = true ]; then
        if ! torsocks wget -qO ./tmp "$url"; then
            error=true
        fi
    else
        if ! wget -qO ./tmp "$url"; then
            error=true
        fi
    fi

    if [ "$error" = true ]; then
        echo -e "${YELLOW}LOCAL HASH:  -${NOCOLOR}"
        echo -e "${YELLOW}REMOTE HASH: -${NOCOLOR}"
        echo -e "${YELLOW}STATUS:      NO CONNECTION $url${NOCOLOR}"
        FILES_NO_CONNECTION="${YELLOW}No connection: $path --> $url${NOCOLOR}\n$FILES_NO_CONNECTION"
        ((COUNTER_CONNECT_FAILED++))
        return 0;
    fi

    # Calculate hash value
    LOCAL_HASH=$(sha512sum "$1" | cut -d " " -f 1)
    REMOTE_HASH=$(sha512sum ./tmp | cut -d " " -f 1)

    if [ "$LOCAL_HASH" != "$REMOTE_HASH" ]; then
        echo -e "${RED}LOCAL HASH:  $LOCAL_HASH${NOCOLOR}"
        echo -e "${RED}REMOTE HASH: $REMOTE_HASH${NOCOLOR}"
        echo -e "${RED}STATUS:      FAILED${NOCOLOR}"
        if [ "$REPLACE" = true ]; then
            if [ "$is_javascript" = true ]; then
                mv ./tmp "${path}m"
            else
                mv ./tmp "${path}"
            fi
            echo -e "${RED}             FILE ALREADY REPLACED${NOCOLOR}"
            FILES_FAILED="${RED}Hash mismatch: $path (File already replaced)${NOCOLOR}\n$FILES_FAILED"
        else
            # No replace
            FILES_FAILED="${RED}Hash mismatch: $path${NOCOLOR}\n$FILES_FAILED"
        fi
        ((COUNTER_HASH_FAILED++))
    else
        echo -e "${GREEN}LOCAL HASH:  $LOCAL_HASH${NOCOLOR}"
        echo -e "${GREEN}REMOTE HASH: $REMOTE_HASH${NOCOLOR}"
        echo -e "${GREEN}STATUS:      PASSED${NOCOLOR}"
        ((COUNTER_HASH_OK++))
    fi
    third_party+=("${url}")
}

# =============================================================================
# CREATE URLs
# =============================================================================
function create_url
{
    if [ "$folder" = "angular-stripe-checkout" ]; then
        url="$JSDELIVR/npm/angular-stripe-checkout@$version/angular-stripe-checkout.min.js"
    elif [ "$folder" = "ethjs" ]; then
        url="$JSDELIVR/npm/ethjs@$version/dist/ethjs.min.js"
    elif [ "$folder" = "findify-bundle" ]; then
        url="$JSDELIVR/npm/@findify/bundle@$version/dist/$subfile"
    elif [ "$folder" = "react-lifecycles-compat" ]; then
        url="$JSDELIVR/npm/react-lifecycles-compat@$version/react-lifecycles-compat.min.js"
    elif [ "$folder" = "react-side-effect" ]; then
        url="https://unpkg.com/react-side-effect@$version/lib/index.umd.min.js"
    elif [ "$folder" = "p2p-media-loader-core" ]; then
        url="$JSDELIVR/npm/p2p-media-loader-core@$version/build/p2p-media-loader-core.min.js"
    elif [ "$folder" = "p2p-media-loader-hlsjs" ]; then
        url="$JSDELIVR/npm/p2p-media-loader-hlsjs@$version/build/p2p-media-loader-hlsjs.min.js"
    elif [ "$folder" = "urlize" ]; then
        url="$JSDELIVR/npm/urlize.js/urlize.js"
    elif [ "$folder" = "videojs-seek-buttons" ]; then
        if [ "$subfile" = "videojs-seek-buttons.min.css" ]; then
            url="$JSDELIVR/npm/videojs-seek-buttons@$version/dist/videojs-seek-buttons.css"
        else
            url="$JSDELIVR/npm/videojs-seek-buttons@$version/dist/videojs-seek-buttons.min.js"
        fi
    elif [ "$folder" = "rocket-loader" ]; then
        url="$CLOUDFLARE_AJAX/7089c43e/cloudflare-static/rocket-loader.min.js"
    elif [ "$folder" = "google-material-design-icons" ]; then
        url="https://fonts.gstatic.com/s/materialicons/$version/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2"
    elif [ "$folder" = "object-assign" ]; then
        url="$JSDELIVR/npm/object-assign@4.1.1/index.js"
    elif [ "$folder" = "mirage2" ]; then
        url="$CLOUDFLARE_AJAX/04b3eb47/cloudflare-static/mirage2.min.js"
    elif [ "$folder" = "highlight.js" ]; then
        if [[ $path =~ .*\.(css|png)$ ]]; then
            url="$CLOUDFLARE/$folder/$version/styles/$subfile"
        elif [[ $subfile = "highlight.min.js" ]]; then
            url="$CLOUDFLARE/$folder/$version/$subfile"
        else
            url="$CLOUDFLARE/$folder/$version/languages/$subfile"
        fi
    elif [ "$folder" = "bootstrap-datepicker" ]; then
        if [[ $file =~ .*\.css$ ]]; then
            url="$CLOUDFLARE/$folder/$version/css/$file"
        elif [[ $jfile =~ .*bootstrap-datepicker.min.js$ ]]; then
            url="$CLOUDFLARE/$folder/$version/js/$jfile"
        else
            url="$CLOUDFLARE/$folder/$version/locales/$jfile"
        fi
    elif [ "$folder" = "select2" ]; then
        if [[ $subfile =~ (select2\.min\.js|select2\.full\.min\.js)$ ]]; then
            url="$CLOUDFLARE/$folder/$version/js/$subfile"
        elif [ "$subfile" = "select2.min.css" ]; then
            url="$CLOUDFLARE/$folder/$version/css/$subfile"
        else
            url="$CLOUDFLARE/$folder/$version/js/i18n/$subfile"
        fi
    elif [ "$folder" = "gsap" ]; then
        if [ "$version" = "1.20.5" ] || [ "$version" = "2.1.3" ]; then
            if [ "$jfile" = "AttrPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/AttrPlugin.min.js"
            elif [ "$jfile" = "BezierPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/BezierPlugin.min.js"
            elif [ "$jfile" = "CSSPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/CSSPlugin.min.js"
            elif [ "$jfile" = "CSSRulePlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/CSSRulePlugin.min.js"
            elif [ "$jfile" = "ColorPropsPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/ColorPropsPlugin.min.js"
            elif [ "$jfile" = "DirectionalRotationPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/DirectionalRotationPlugin.min.js"
            elif [ "$jfile" = "EaselPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/EaselPlugin.min.js"
            elif [ "$jfile" = "EndArrayPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/EndArrayPlugin.min.js"
            elif [ "$jfile" = "ModelifiersPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/ModelifiersPlugin.min.js"
            elif [ "$jfile" = "PixiPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/PixiPlugin.min.js"
            elif [ "$jfile" = "RaphaelPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/RaphaelPlugin.min.js"
            elif [ "$jfile" = "RoundPropsPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/RoundPropsPlugin.min.js"
            elif [ "$jfile" = "ScrollToPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/ScrollToPlugin.min.js"
            elif [ "$jfile" = "TextPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/TextPlugin.min.js"
            elif [ "$jfile" = "EasePack.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/easing/EasePack.min.js"
            elif [ "$jfile" = "Draggable.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/utils/Draggable.min.js"
            elif [ "$jfile" = "ModifiersPlugin.min.js" ]; then
                url="$CLOUDFLARE/$folder/$version/plugins/ModifiersPlugin.min.js"
            else
                url="$CLOUDFLARE/$folder/$version/$jfile"
            fi
        else
            url="$CLOUDFLARE/$folder/$version/$jfile"
        fi
    elif [ "$folder" = "element-ui" ]; then
        if [ "$jfile" = "index.min.css" ]; then
            url="$CLOUDFLARE/$folder/$version/theme-chalk/index.min.css"
        elif [ "$jfile" = "index.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/$jfile"
        elif [ "$subfile" = "element-icons.woff" ]; then
            url="$CLOUDFLARE/$folder/$version/theme-chalk/fonts/element-icons.woff"
        else
            url="$CLOUDFLARE/$folder/$version/locale/$jfile"
        fi
    elif [ "$folder" = "bootstrap-multiselect" ]; then
        url="$CLOUDFLARE/$folder/$version/js/$jfile"
    elif [ "$folder" = "bootstrap-slider" ] && [ "$jfile" = "bootstrap-slider.min.css" ]; then
        url="$CLOUDFLARE/$folder/$version/css/$jfile"
    elif [ "$folder" = "drawer" ]; then
        if [[ $jfile =~ .*\.css$ ]]; then
            url="$CLOUDFLARE/$folder/$version/css/$jfile"
        elif [[ $jfile =~ .*\.js$ ]]; then
            url="$CLOUDFLARE/$folder/$version/js/$jfile"
        fi
    elif [ "$folder" = "jScrollPane" ]; then
        if [ "$jfile" = "jquery.jscrollpane.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/script/$jfile"
        fi
    elif [ "$folder" = "mdb-ui-kit" ]; then
        if [ "$jfile" = "mdb-ui-kit.min.css" ]; then
            url="$CLOUDFLARE/$folder/$version/mdb.min.css"
        elif [ "$jfile" = "mdb-ui-kit.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/mdb.min.js"
        fi
    elif [ "$folder" = "ember.js" ]; then
        if [ "$jfile" = "ember.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/ember.debug.js"
        fi
    elif [ "$folder" = "Modaal" ]; then
        if [ "$jfile" = "modaal.min.css" ]; then
            url="$CLOUDFLARE/$folder/$version/css/$jfile"
        elif [ "$jfile" = "modaal.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/js/$jfile"
        fi
    elif [ "$folder" = "owl-carousel" ]; then
        if [ "$version" = "1.3.3" ]; then
            url="$CLOUDFLARE/owl-carousel/$version/$jfile"
        else
            url="$CLOUDFLARE/OwlCarousel2/$version/$jfile"
        fi
    elif [ "$folder" = "p5.js" ]; then
        if [ "$jfile" = "p5.sound.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/addons/$jfile"
        else
            url="$CLOUDFLARE/$folder/$version/$jfile"
        fi
    elif [ "$folder" = "paginationjs" ]; then
        if [ "$jfile" = "pagination.min.css" ]; then
            url="$CLOUDFLARE/$folder/$version/pagination.css"
        else
            url="$CLOUDFLARE/$folder/$version/$jfile"
        fi
    elif [ "$folder" = "OwlCarousel2" ]; then
        if [ "$subfile" = "owl.carousel.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/$subfile"
        else
            url="$CLOUDFLARE/$folder/$version/assets/$subfile"
        fi
    elif [ "$folder" = "slider-pro" ]; then
        url="$CLOUDFLARE/$folder/$version/js/$jfile"
    elif [ "$folder" = "Swiper" ] && [ "$version" = "6.4.15" ]; then
        if [[ "$path" =~ .*swiper\.min\.css$ ]]; then
            url="$CLOUDFLARE/$folder/$version/swiper-bundle.min.css"
        elif [[ "$path" =~ .*swiper\.min\.js$ ]]; then
            url="$CLOUDFLARE/$folder/$version/swiper-bundle.min.js"
        fi
    elif [ "$folder" = "tooltipster" ] && [ "$version" = "4.2.8" ]; then
        url="$CLOUDFLARE/$folder/$version/js/tooltipster.bundle.min.js"
    elif [ "$folder" = "vue" ] && [ "$version" = "3.0.6" ]; then
        url="$CLOUDFLARE/$folder/$version/vue.global.prod.js"
    elif [ "$folder" = "waypoints" ]; then
        if [ "$jfile" = "infinite.min.js" ] || [ "$jfile" = "inview.min.js" ] || [ "$jfile" = "sticky.min.js" ]; then
            url="$CLOUDFLARE/$folder/$version/shortcuts/$jfile"
        else
            url="$CLOUDFLARE/$folder/$version/$jfile"
        fi
    elif [ "$folder" = "twitter-bootstrap" ]; then
        if [[ "$subfile" =~ \.css$ ]]; then
            url="$CLOUDFLARE/$folder/$version/css/$subfile"
        elif [[ "$subfile" =~ \.js$ ]]; then
            url="$CLOUDFLARE/$folder/$version/js/$subfile"
        elif [ "$subfile" = "glyphicons-halflings-regular.woff2" ]; then
            url="$CLOUDFLARE/twitter-bootstrap/3.4.1/fonts/glyphicons-halflings-regular.woff2"
        fi
    elif [ "$folder" = "webcomponentsjs" ]; then
        url="$CLOUDFLARE/$folder/2.5.0/webcomponents-loader.min.js"
    elif [ "$folder" = "vue-i18n" ] && [ "$version" = "9.0.0" ]; then
        url="$CLOUDFLARE/$folder/$version/vue-i18n.cjs.min.js"
    elif [ "$path" = "../resources/twitter-bootstrap/fonts/glyphicons-halflings-regular.woff2" ]; then
        url="$CLOUDFLARE/twitter-bootstrap/3.4.1/fonts/glyphicons-halflings-regular.woff2"
    elif [ "$subfile" = "jquery-ui.min.css" ]; then
        url="$CLOUDFLARE/jqueryui/1.8.24/themes/base/minified/jquery-ui.min.css"
    elif [ "$folder" = "raven.js" ]; then
        url="$JSDELIVR/npm/raven-js@3.27.2/dist/raven.min.js"
    elif [ "$folder" = "jquery-validate" ]; then
        url="$GITHUB/jquery-validation/jquery-validation/$version/dist/jquery.validate.min.js"
    elif [ "$folder" = "jquery-validate" ]; then
        url="$GITHUB/jquery-validation/jquery-validation/$version/dist/jquery.validate.min.js"
    elif [ "$folder" = "history" ] && [ "$version" = "5.0.0" ] && [ "$jfile" = "history.min.js" ]; then
        url="$CLOUDFLARE/history/5.0.0/history.production.min.js"
    elif [ "$folder" = "ember.js" ] && [ "$version" = "3.24.2" ] && [ "$jfile" = "ember.min.js" ]; then
        url="$CLOUDFLARE/ember.js/3.24.2/ember.debug.js"
    elif [ "$folder" = "dojo" ] && [ "$version" = "1.16.3" ]; then
        url="$CLOUDFLARE/dojo/1.16.3/dojo.min.js"
    elif [ "$folder" = "material-design-icons" ]; then
        url="$GITHUB/Templarian/MaterialDesign-Webfont/v$version/$jfile/$subfile"
    elif [ "$folder" = "algoliasearch" ]; then
        if [ "$version" = "3.35.1" ]; then
            url="$CLOUDFLARE/algoliasearch/$version/algoliasearch.min.js"
        else
            url="$CLOUDFLARE/algoliasearch/$version/algoliasearch.umd.min.js"
        fi
    elif [ "$folder" = "angular-translate" ]; then
        if [ "$subfile" = "angular-translate.min.js" ]; then
            url="$CLOUDFLARE/angular-translate/$version/$subfile"
        else
            subfolder=$(echo -e "$subfile" | sed 's/\.min\.js//')
            url="$CLOUDFLARE/$folder/$version/$subfolder/$subfile"
        fi
    elif [ "$folder" = "ajax-bootstrap-select" ]; then
        url="$CLOUDFLARE/$folder/$version/js/$subfile"
    elif [ "$folder" = "algoliasearch3.33.0_algoliasearchLite_algoliasearchHelper.jsm" ]; then
        url="$JSDELIVR/g/algoliasearch@3(algoliasearchLite.min.js),algoliasearch.helper@2"
    elif [ "$subfile" = "videojs-seek-buttons.min.js" ]; then
        url="$JSDELIVR/npm/videojs-seek-buttons/dist/videojs-seek-buttons.js"
    elif [ "$subfile" = "jsdelivr-combine-jquery-hogan-algoliasearch-autocomplete.js" ]; then
        url="$JSDELIVR/combine/npm/jquery@2.2.4/dist/jquery.min.js,npm/hogan.js@3.0.2/dist/hogan-3.0.2.min.js,npm/algoliasearch@3.30.0/dist/algoliasearch.min.js,npm/autocomplete.js@0.31.0/dist/autocomplete.min.js"
    elif [ "$folder" = "vue-resource" ]; then
        url="$GITHUB/pagekit/vue-resource/$version/dist/vue-resource.min.js"
    elif [ "$path" = "../resources/webfont/fa-loader.js" ]; then
        url="https://use.fontawesome.com/a1f20be65b.js"
    else
        if [ "$subfile" = "$jfile" ]; then
            url="$CLOUDFLARE/$folder/$version/$subfile"
        else
            url="$CLOUDFLARE/$folder/$version/$file/$subfile"
        fi
    fi
}

# =============================================================================
# MAIN
# =============================================================================
array=()
# Find files in /resource/
while IFS=  read -r -d $'\0'; do
    array+=("$REPLY")
done < <(find ../resources/ -type f \( -iname "*.jsm" -or -iname "*.css" -or -iname "*.woff" -or -iname "*.woff2" \) ! -iname "fa-loader.css" ! -iname "google-material-design-icons.css" -print0)

third_party=()

for i in "${array[@]}"; do
    check_resource "$i"
done

rm ./tmp 2> /dev/null

IFS=$'\n' sorted=($(sort <<<"${third_party[*]}"))
unset IFS

if [ "$CREATE_THIRD_PARTY_FILE" = true ]; then
    printf "%s\n" "${sorted[@]}" > ../THIRD_PARTY.txt
fi

echo -e "\n\n\n"
echo -e "$DIVIDER"
echo -e "${GREEN}${BOLD}D O N E${NORMAL}${NOCOLOR}"
echo -e "$DIVIDER"
echo -e "${BOLD}Total:${NORMAL}          $COUNTER_ALL"
echo -e ""
echo -e "${BOLD}Hash passed:  ${NORMAL}  $COUNTER_HASH_OK"
echo -e "${BOLD}Hash mismatch:${NORMAL}  $COUNTER_HASH_FAILED"
echo -e "${BOLD}Skipped:      ${NORMAL}  $COUNTER_SKIPPED"
echo -e "${BOLD}No connection:${NORMAL}  $COUNTER_CONNECT_FAILED"
echo -e ""
echo -e "$FILES_FAILED$FILES_SKIPPED$FILES_NO_CONNECTION"
echo -e ""
