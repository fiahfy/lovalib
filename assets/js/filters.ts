/// <reference path="_all.ts" />

module lova {
    'use strict';

    export function pad() {
        return (input: string, length: number, str: string) => {
            return ((new Array(length+1)).join(str) + input).slice(-length);
        };
    }

    export function def() {
        return (input: string, value: any) => {
            return (typeof input === 'undefined' || input == null) ? value : input;
        };
    }

    export function replace() {
        return (input: string, regexp: string, newSubStr: string) => {
            if (!input) {
                return input;
            }
            var reg = new RegExp(regexp);
            return input.replace(reg, newSubStr);
        };
    }

    export function skillDescription($sce: ng.ISCEService) {
        return (skill: any) => {
            var desc = skill.description;
            if (!desc) {
                return desc;
            }
            desc = desc
                .replace(/(^|\n)\d+\.\s/g, '$1')
                .replace(/\n/g, '<br/><br/>')
                .replace(/［([^］]+)］/g, '<br/>&nbsp;&nbsp;<b>- $1</b>')
                .replace(/：/g, ' : ');

            var cd = skill.cd;
            if (cd) {
                cd = '- クールダウン : ' + cd.replace(/,/g, ' / ');
                desc = desc.replace(/<br\/>/, '<br/>&nbsp;&nbsp;<b>' + cd + '</b><br/>');
            }

            var ap = skill.ap;
            if (ap) {
                ap = '- 消費AP : ' + ap.replace(/,/g, ' / ');
                desc = desc.replace(/<br\/>/, '<br/>&nbsp;&nbsp;<b>' + ap + '</b><br/>');
            }

            return $sce.trustAsHtml(desc);
        }
    }
}
