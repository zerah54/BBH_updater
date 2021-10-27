// ==UserScript==
// @name         BBH, GH & Fata Updater
// @description  Update BBH, GH & Fata
// @author       Zerah
// @version      2.0
// @match        https://zombvival.de/myhordes/*
// @match        https://myhordes.de/*
// @match        https://myhordes.eu/*
// @match        https://myhord.es/*
// @match        https://bbh.fred26.fr/*
// @match        https://gest-hordes2.eragaming.fr/*
// @match        https://fatamorgana.md26.eu/*
// @require      http://userscripts-mirror.org/scripts/source/107941.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    "use strict";
    let bbh_updated = false;
    let gh_updated = false;

    const gmUserKey = "user_key";
    const gmBbhUpdatedKey = "bbh_updated";
    const gmGhUpdatedKey = "gh_updated";
    const gmFataUpdatedKey = "fata_updated";

    const start_icon = "<img src='/myhordes/build/images/emotes/arrowright.7870eca6.gif'/>";
    const success_icon = "<img src='/myhordes/build/images/professions/hero.0cdc29a3.gif'/>"
    const pending_icon = "<img src='/myhordes/build/images/emotes/middot.d673b4c1.gif'/>"
    const error_icon = "<img src='/myhordes/build/images/emotes/warning.8e2e7b6f.gif'/>";

    const title = "BBH, GH & Fata Updater ";
    const need_update_text = start_icon + "Mettre à jour BBH, GH & Fata";
    const send_key_error_text = "Impossible d'enregistrer la clé";

    const bbh_pending_text = pending_icon + "Mise à jour de BBH en cours...";
    const bbh_error_text = error_icon + "BBH n'a pas pu être mis à jour.";
    const bbh_success_text = success_icon + "BBH a été mis à jour !";

    const gh_pending_text = pending_icon + "Mise à jour de GH en cours...";
    const gh_error_text = error_icon + "GH n'a pas pu être mis à jour.";
    const gh_success_text = success_icon + "GH a été mis à jour !";

    const fata_pending_text = pending_icon + "Mise à jour de Fata en cours...";
    const fata_error_text = error_icon + "Fata n'a pas pu être mis à jour.";
    const fata_success_text = success_icon + "Fata a été mis à jour !";

    const all_updated_text = success_icon + "BBH, GH & Fata ont été mis à jour !";
    const all_error_text = error_icon + "BBH, GH & Fata n'ont pas pu être mis à jour !";

    const btn_id = "maj_updater";

    if(document.URL.startsWith("https://bbh.fred26.fr/") || document.URL.startsWith("https://gest-hordes2.eragaming.fr/") || document.URL.startsWith("https://fatamorgana.md26.eu/")) {
        let current_key = '';
        if (document.URL.startsWith("https://bbh.fred26.fr/")) {
            current_key = gmBbhUpdatedKey
        } else if (document.URL.startsWith("https://gest-hordes2.eragaming.fr/")) {
            current_key = gmGhUpdatedKey;
        } else {
            current_key = gmFataUpdatedKey;
        }

        // Si on est sur le site de BBH ou GH ou Fata et que BBH ou GH ou Fata a été mis à jour depuis MyHordes, alors on recharge BBH ou GH ou Fata au moment de revenir sur l'onglet
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
                updater_title.innerHTML = title;
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

                // met à jour le contenu du bouton
                let parseButtonDisplay = function(states) {
                    let display = "<ul style=\"padding: 0; list-style-type: none;\">";

                    if (states) {
                        states.forEach(state => {
                            display += "<li>" + state + "</li>";
                        })
                    }
                    display += "</ul>";

                    return display;
                }

                let updateGh = function (btn, error, success) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: "https://gest-hordes2.eragaming.fr/?reset=",
                        onload: function(response){
                            if(response.status === 200) {
                                // Si la réponse est OK, on met à jour le texte
                                btn.innerHTML = parseButtonDisplay(success);
                                updateFata(btn, error, success);
                                GM_setValue(gmGhUpdatedKey, true);
                            } else {
                                // Sinon, on affiche une erreur
                                btn.innerHTML = parseButtonDisplay(error);
                                updateFata(btn, error, success);
                                console.log(response);
                            }
                        }
                    })
                }

                let updateFata = function (btn, error, success) {
                    GM_xmlhttpRequest({
                        method: "POST",
                        url: "https://fatamorgana.md26.eu/map/updatemyzone?key=" + user_key,
                        onload: function(response) {
                            if(response.status === 200) {
                                // Si la réponse est OK, on met à jour le texte
                                let full_success = success.splice(0, 2);
                                full_success.push(fata_success_text);
                                btn.innerHTML = parseButtonDisplay(full_success);
                                GM_setValue(gmFataUpdatedKey, true);
                            } else {
                                // Sinon, on affiche une erreur
                                let full_error = error.splice(0, 2);
                                full_error.push(fata_error_text);
                                btn.innerHTML = parseButtonDisplay(full_error);
                                console.log(response);
                            }
                        }
                    })
                }

                let createButton = function() {
                    let btn = document.createElement("button");

                    btn.innerHTML = need_update_text;
                    btn.id = btn_id;

                    btn.addEventListener("click", () => {
                        // Au clic sur le bouton, on met à jour BBH
                        let bbh_data = bbh_key_url + user_key + bbh_sid_url + bbh_sid;
                        let bbh_url = bbh_update_url + bbh_data;

                        btn.innerHTML = bbh_pending_text;
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
                                    btn.innerHTML = parseButtonDisplay([bbh_success_text, gh_pending_text]);
                                    GM_setValue(gmBbhUpdatedKey, true);

                                    // Puis on met à jour GH
                                    updateGh(btn, [bbh_success_text, gh_error_text, fata_pending_text], [bbh_success_text, gh_success_text, fata_pending_text]);
                                } else {
                                    // Sinon on affiche une erreur
                                    btn.innerHTML = parseButtonDisplay([bbh_error_text, gh_pending_text]);
                                    console.error(response);

                                    // On met à jour GH
                                    updateGh(btn, [bbh_error_text, gh_error_text, fata_pending_text], [bbh_error_text, gh_success_text, fata_pending_text]);
                                }
                            }
                        })
                    })

                    updater_bloc.appendChild(btn);
                    return;
                }

                if(!user_key) {
                    // Si la user_key n'a jamais été renseignée

                    // CREATION DU BOUTON D'AIDE \\
                    let help_button = document.createElement("a");
                    help_button.innerHTML = "Aide";
                    help_button.classList.add("help-button");

                    let help_tooltip = document.createElement("div")
                    help_tooltip.setAttribute("style", "display: none");
                    help_tooltip.classList.add("tooltip");
                    help_tooltip.classList.add("help");
                    help_tooltip.innerHTML = "Vous devez renseigner votre ID externe pour les apps.<br />Celle-ci se trouve dans \"Votre âme\" > \"Réglages\" > section \"Applications externes\""
                    help_button.appendChild(help_tooltip);

                    help_button.addEventListener("mouseenter", function() {
                        help_tooltip.setAttribute("style", "display: block; text-transform: initial");
                    })
                    help_button.addEventListener("mouseleave", function() {
                        help_tooltip.setAttribute("style", "display: none");
                    })
                    updater_title.appendChild(help_button);
                    // FIN DE LA CREATION DU BOUTON D'AIDE \\

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
                                    updater_title.removeChild(help_button);

                                    GM_setValue(gmUserKey, keytext.value);
                                    user_key = GM_getValue(gmUserKey);
                                    createButton();
                                } else {
                                    // Si la mise à jour est un échec, alors on affiche l'erreur dans le bouton
                                    keysend.innerHTML = error_icon + parseErrorResponse(response);
                                    updateGh(keysend, [send_key_error_text, gh_error_text, fata_pending_text], [send_key_error_text, gh_success_text, fata_pending_text]);
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
