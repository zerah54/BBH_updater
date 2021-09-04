// ==UserScript==
// @name         BBH & GH Updater
// @description  Update BBH from the world beyond
// @author       Zerah
// @version      0.4
// @match        https://zombvival.de/myhordes/*
// @match        https://myhordes.de/*
// @match        https://myhordes.eu/*
// @match        https://bbh.fred26.fr/*
// @match        https://gest-hordes2.eragaming.fr/*
// @require      http://userscripts-mirror.org/scripts/source/107941.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    "use strict";
    let bbh_updated = false;
    let gh_updated = false;

    const gmUpdate = "update";
    const gmLastUpdatedKey = "last_updated";
    const gmUserKey = "user_key";
    const gmBbhUpdatedKey = "bbh_updated";
    const gmGhUpdatedKey = "gh_updated";

    const start_icon = "<img src='/myhordes/build/images/emotes/arrowright.a107984b.gif'/>";
    const success_icon = "<img src='/myhordes/build/images/professions/hero.93053174.gif'/>"
    const pending_icon = "<img src='/myhordes/build/images/emotes/middot.d1d816f1.gif'/>"
    const error_icon = "<img src='/myhordes/build/images/emotes/warning.27542da7.gif'/>";

    const need_update_text = start_icon + "Mettre à jour BBH & GH";
    const updating_text = pending_icon + "Mise à jour de BBH en cours...";
    const updated_text = "<ul style=\"padding: 0; list-style-type: none;\">"
    + "<li>" + success_icon + "BBH a été mis à jour !</li>"
    + "<li>" + pending_icon + "Mise à jour de GH en cours...</li>"
    + "</ul>";
    const both_updated_text = success_icon + "BBH et GH ont été mis à jour !";

    const btn_id = "maj_updater";

    if(document.URL.startsWith("https://bbh.fred26.fr/") || document.URL.startsWith("https://gest-hordes2.eragaming.fr/")) {
        const current_key = document.URL.startsWith("https://bbh.fred26.fr/") ? gmBbhUpdatedKey : gmGhUpdatedKey;
        // Si on est sur le site de BBH ou GH et que BBH ou GH a été mis à jour depuis MyHordes, alors on recharge BBH ou GH au moment de revenir sur l'onglet
        document.addEventListener("visibilitychange", function() {
            if (GM_getValue(current_key) && !document.hidden) {
                GM_setValue(current_key, false);
                location.reload();
            }
        });
    } else {
        setInterval(() => {
            const zone_marker = document.getElementById("zone-marker");
            if (zone_marker) {
                // Si on est sur le site de MyHorde et que la page contient la zone "marqueurs de zones"

                let el = zone_marker.parentElement;

                // Si le bouton existe, alors on n'en crée pas de nouveau
                if(document.getElementById(btn_id)) return;

                let updater_bloc = document.createElement("div");
                el.appendChild(updater_bloc);
                let updater_title = document.createElement("h5");
                updater_title.innerHTML = "BBH & GH Updater";
                updater_bloc.appendChild(updater_title);

                const bbh_update_url = "https://bbh.fred26.fr/update.php";
                const bbh_key_url = "?key=";
                const bbh_sid_url = "&sid=";
                const bbh_sid = document.URL.indexOf("hordes.fr") > -1 ? 1 : 5;

                let user_key = GM_getValue(gmUserKey);

                let parseErrorResponse = function (response) {
                    return response.responseText.substring(
                        response.responseText.indexOf("[CDATA[") + "[CDATA[".length,
                        response.responseText.lastIndexOf("]]")
                    );
                }

                let createButton = function() {
                    let btn = document.createElement("button");

                    btn.innerHTML = need_update_text;
                    btn.id = btn_id;

                    btn.addEventListener("click", () => {
                        // Au clic sur le bouton, on met à jour BBH
                        let bbh_data = bbh_key_url + user_key + bbh_sid_url + bbh_sid;
                        let bbh_url = bbh_update_url + bbh_data;

                        btn.innerHTML = updating_text;
                        GM_xmlhttpRequest({
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            url: bbh_url,
                            responseType: "text",
                            onload: function(response){
                                if(response.responseText.indexOf("code=\"ok\"") > -1) {
                                    // Si la réponse est OK, on met à jour le texte
                                    btn.innerHTML = updated_text;
                                    GM_setValue(gmBbhUpdatedKey, true);

                                    // Puis on met à jour GH
                                    GM_xmlhttpRequest({
                                        method: "GET",
                                        url: "https://gest-hordes2.eragaming.fr/?reset=",
                                        onload: function(response){
                                            if(response.status === 200) {
                                                // Si la réponse est OK, on met à jour le texte
                                                btn.innerHTML = both_updated_text;
                                                GM_setValue(gmGhUpdatedKey, true);
                                            } else {
                                                // Sinon, on affiche une erreur
                                                btn.innerHTML = error_icon + "Erreur lors de la mise à jour";
                                                console.log(response);
                                            }
                                        }
                                    })
                                } else {
                                    // Sinon on affiche une erreur
                                    btn.innerHTML = error_icon + parseErrorResponse(response);
                                    console.log(response);
                                }
                            }
                        })
                    })

                    updater_bloc.appendChild(btn);
                    return;
                }

                if(!user_key) {
                    // Si la user_key n'a jamais été renseignée

                    // On crée un input pour saisir la user_key
                    let keytext = document.createElement("input");
                    keytext.setAttribute("type","text");

                    // On crée un bouton pour envoyer la user_key
                    let keysend = document.createElement('button');
                    let save_external_text = "Enregistrez votre ID d'app externe";
                    keysend.innerHTML = save_external_text;
                    keysend.id = btn_id;

                    keysend.addEventListener("click",() => {
                        // Au clic sur le bouton, on envoie une mise à jour de l'API
                        let bbh_data = bbh_key_url + keytext.value + bbh_sid_url + bbh_sid;
                        let bbh_url = bbh_update_url + bbh_data;
                        GM_xmlhttpRequest({
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            url: bbh_url,
                            responseType: "text",
                            onload: function(response){
                                if(response.responseText.indexOf("code=\"ok\"") > -1) {
                                    // Si la mise à jour est un succès, alors on retire ce qui est spécifique au user_key, et on enregistre la user_key dans le stockage de GM
                                    updater_bloc.removeChild(keytext);
                                    updater_bloc.removeChild(keysend);
                                    GM_setValue(gmUserKey, keytext.value);
                                    user_key = GM_getValue(gmUserKey);
                                    createButton();
                                } else {
                                    // Si la mise à jour est un échec, alors on affiche l'erreur dans le bouton
                                    keysend.innerHTML = error_icon + parseErrorResponse(response);
                                    console.log(response);
                                }
                            }
                        });

                    });

                    updater_bloc.appendChild(keytext);
                    updater_bloc.appendChild(keysend);
                    return;
                } else {
                    createButton();
                }
            }
        }, 500);
    }
})();
