// ==UserScript==
// @name         BBH Updater
// @description  Update BBH from the world beyond
// @author       Zerah
// @version      0.1
// @match        https://zombvival.de/myhordes/*
// @match        https://bbh.fred26.fr/*
// @require      http://userscripts-mirror.org/scripts/source/107941.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==

(function() {
    'use strict';
    setInterval(() => {
        const updateBBHKey = "bbh_update";
        const lastUpdatedKey = "bbh_last_updated";
        const need_update = "<img src='/myhordes/build/images/emotes/arrowright.a107984b.gif'/>Mettre à jour BBH";
        const updated = "<img src='/myhordes/build/images/professions/hero.93053174.gif'/>BBH a été mis à jour !"
        let r = document.getElementById('zone-marker');

        if (document.URL.startsWith('https://bbh.fred26.fr/')) {
            // Si on est sur le site de BBH, on souscrit à la mise à jour d'une valeur, mise à jour lorsqu'on clique sur le bouton "MaJ BBH"
            GM_addValueChangeListener(updateBBHKey, function (keyName, oldValue, newValue, bRmtTrggrd){

                if(bRmtTrggrd) {
                    document.getElementById('f_maj').submit();
                }

                Number.prototype.padLeft = function(base,chr){
                    var len = (String(base || 10).length - String(this).length)+1;
                    return len > 0? new Array(len).join(chr || '0')+this : this;
                }

                let date = new Date;
                let formatted_date = " le " +
                    date.getDate().toString().padStart(2, '0') + '/' + (date.getMonth()+1).toString().padStart(2, '0') + '/' + date.getFullYear().toString().padStart(4, '0') + ' à ' +
                    date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0') + ':' + date.getSeconds().toString().padStart(2, '0');
                GM_setValue(lastUpdatedKey, formatted_date);

            })
        } else if (r) {
            // Si on est sur le site de MyHorde

            let el = r.parentElement;
            // Si le bouton existe, alors on n'en crée pas de nouveau
            if(el.innerHTML.includes('BBH')) return;

            let btn = document.createElement('button');

            btn.innerHTML = need_update;
            btn.title = "L'onglet BBH doit être ouvert dans votre navigateur";

            // Au clic sur le bouton, on regarde ce qu'il faut faire
            btn.addEventListener('click',() => {
                GM_setValue(updateBBHKey, Math.random());
            });

            el.appendChild(btn);

            // Si la valeur de dernière mise à jour de BBH a été changée, alors on change l'état du bouton
            GM_addValueChangeListener(lastUpdatedKey, function (keyName, oldValue, newValue, bRmtTrggrd){
                btn.innerHTML = updated + newValue;
            })

            let move_buttons = Array.from(document.getElementsByClassName("action-move"));
            let inventory_buttons = Array.from(document.getElementsByClassName("inventory")).map((inventory_item) => {
                return Array.from(inventory_item.getElementsByClassName("item")).filter((item) => !item.classList.contains("locked"));
            });
            let items_buttons = inventory_buttons[0].concat(inventory_buttons[1]);
            let heroic_buttons = Array.from(document.getElementsByClassName("heroic_action"));
            let action_buttons = Array.from(document.getElementsByClassName("action"));

            let list_buttons = move_buttons.concat(items_buttons).concat(heroic_buttons).concat(action_buttons);

            // on surveille tous les boutons d'action pour réinitialiser l'état du bouton de mise à jour au moindre clic sur un bouton d'action
            list_buttons.forEach((action_button) => {
                action_button.addEventListener('click', () => {
                    btn.innerHTML = need_update;
                })
            });
        }
    },500);
})();
