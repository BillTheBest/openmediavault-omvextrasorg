/**
 * @license   http://www.gnu.org/licenses/gpl.html GPL Version 3
 * @author    Volker Theile <volker.theile@openmediavault.org>
 * @author    Aaron Murray <aaron@omv-extras.org>
 * @copyright Copyright (c) 2009-2013 Volker Theile
 * @copyright Copyright (c) 2013-2014 Aaron Murray 
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
// require("js/omv/WorkspaceManager.js")
// require("js/omv/workspace/form/Panel.js")
// require("js/omv/data/Store.js")
// require("js/omv/data/Model.js")
// require("js/omv/window/MessageBox.js")

Ext.define("OMV.module.admin.system.omvextrasorg.Primary", {
    extend : "OMV.workspace.form.Panel",

    rpcService   : "OmvExtrasOrg",
    rpcGetMethod : "getPrimary",
    rpcSetMethod : "setPrimary",

    initComponent : function () {
        var me = this;

        me.on('load', function () {
            var code = me.findField('developer').getValue();
            var parent = me.up('tabpanel');

            if (!parent)
                return;

            var developerPanel = parent.down('panel[title=' + _("Developer") + ']');

            if (developerPanel) {
                if (code == '0827') {
                    developerPanel.tab.show();
                } else {
                    developerPanel.tab.hide();
                }
            }
        });
        me.callParent(arguments);

        me.on("submit", function() {
            OMV.MessageBox.show({
                title      : _("Confirmation"),
                msg        : _("The information about available software is out-of-date. You need to reload the information about available software."),
                buttons    : Ext.MessageBox.OKCANCEL,
                buttonText : {
                    ok      : _("Reload"),
                    cancel  : _("Close")
                },
                fn         : function(answer) {
                    if("cancel" === answer)
                        return;
                    OMV.RpcObserver.request({
                        title   : _("Downloading package information"),
                        msg     : _("The repository will be checked for new, removed or upgraded software packages."),
                        rpcData : {
                            service : "Apt",
                            method  : "update"
                        }
                    });
                },
                scope : me,
                icon  : Ext.Msg.QUESTION
            });
        }, me);
    },

    getFormItems : function() {
        var me = this;
        return [{
            xtype         : "fieldset",
            title         : _("Repositories"),
            fieldDefaults : {
                labelSeparator : ""
            },
            items         : [{
                xtype      : "checkbox",
                name       : "enable",
                fieldLabel : _("OMV-Extras.org"),
                boxLabel   : _("Enable OMV-Extras.org repository"),
                checked    : true
            },{
                xtype      : "checkbox",
                name       : "testing",
                fieldLabel : _("Testing"),
                boxLabel   : _("Enable OMV-Extras.org testing repository (release candidates)"),
                checked    : false
            }]
        },{
            xtype         : "fieldset",
            title         : _("Utilities"),
            fieldDefaults : {
                labelSeparator : ""
            },
            items         : [{
                xtype   : "button",
                name    : "aptclean",
                text    : _("Apt Clean"),
                scope   : this,
                handler : Ext.Function.bind(me.onAptCleanButton, me, [ me ]),
                margin  : "3 0 5 0"
            },{
                border : false,
                html   : "<ul>" +
                           "<li>" + _("Cleans apt repositories and removes lists.") + "</li>" +
                           "<li>" + _("Can be helpful in fixing plugin problems.") + "</li>" +
                         "</ul>"
            },{
                xtype   : "button",
                name    : "backports",
                text    : _("Install Backports 3.2 kernel"),
                scope   : this,
                handler : Ext.Function.bind(me.onBackportsButton, me, [ me ]),
                margin  : "0 0 5 0"
            },{
                border : false,
                html   : "<ul>" +
                           "<li>" + _("This will not uninstall the 2.6 kernel.") + "</li>" +
                           "<li>" + _("If the system does not boot using the 3.2 kernel, the boot menu will still have the option to boot the 2.6 kernel.") + "</li>" +
                         "</ul>"
            }]
        },{
            xtype         : "fieldset",
            title         : _("Information"),
            fieldDefaults : {
                labelSeparator : ""
            },
            items         : [{
                xtype      : "textfield",
                name       : "version",
                fieldLabel : _("Version"),
                allowBlank : true,
                readOnly   : true
            },{
                xtype      : "textfield",
                name       : "kernel",
                fieldLabel : _("Kernel"),
                allowBlank : true,
                readOnly   : true
            },{
                xtype      : "textfield",
                name       : "developer",
                fieldLabel : _("Developer"),
                allowBlank : true
            }]
        }];
    },

    onBackportsButton : function() {
        var me = this;
        Ext.create("OMV.window.Execute", {
            title          : _("Install Backports 3.2 kernel ..."),
            rpcService     : "OmvExtrasOrg",
            rpcMethod      : "doInstallBackports",
            hideStopButton : true,
            listeners      : {
                scope     : me,
                exception : function(wnd, error) {
                    OMV.MessageBox.error(null, error);
                }
            }
        }).show();
    },

    onAptCleanButton : function() {
        var me = this;

        OMV.MessageBox.wait(null, _("Cleaning Apt Files and Lists..."));
        OMV.Rpc.request({
            scope       : me,
            relayErrors : false,
            rpcData     : {
                service  : "OmvExtrasOrg",
                method   : "doAptClean"
            },
            success : function(id, success, response) {
                me.doReload();
                OMV.MessageBox.hide();
            }
        });
    }
});

OMV.WorkspaceManager.registerPanel({
    id        : "primary",
    path      : "/system/omvextrasorg",
    text      : _("Primary"),
    position  : 10,
    className : "OMV.module.admin.system.omvextrasorg.Primary"
});
