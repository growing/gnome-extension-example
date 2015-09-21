/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */

const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Lang = imports.lang;
const Shell = imports.gi.Shell;
const St = imports.gi.St;
const Tweener = imports.ui.tweener;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;
const N_ = function(x) { return x; }

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const EXAMPLE_ICON_SIZE = 16;

function _showPopup(label) {

    text = new St.Label({ style_class: 'helloworld-label', text: "Pressed " + label});
    Main.uiGroup.add_actor(text);

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(monitor.x + Math.floor(monitor.width / 2 - text.width / 2),
                      monitor.y + Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: function() {
                         Main.uiGroup.remove_actor(text);
                       } });
}

const ExampleMenuItem = new Lang.Class({
  Name: 'ExampleMenuItem',
  Extends: PopupMenu.PopupBaseMenuItem,

  _init: function(info) {
    this.parent();
    this._info = info;

    this._icon = new St.Icon({ gicon: info.icon,
      icon_size: EXAMPLE_ICON_SIZE });
      this.actor.add_child(this._icon);

      this._label = new St.Label({ text: info.name });
      this.actor.add_child(this._label);
    },

    destroy: function() {
      if (this._changedId) {
        this._info.disconnect(this._changedId);
        this._changedId = 0;
      }

      this.parent();
    },

    activate: function(event) {
      _showPopup(this._label.text);

      this.parent(event);
    },

    _propertiesChanged: function(info) {
      this._icon.gicon = info.icon;
      this._label.text = info.name;
    },
  });

  const SECTIONS = [
    'one',
    'two',
    'three',
    'four'
  ]

  const ExampleMenu = new Lang.Class({
    Name: 'ExampleMenu.ExampleMenu',
    Extends: PanelMenu.Button,

    _init: function() {
      this.parent(0.0, _("Example"));

      let hbox = new St.BoxLayout({ style_class: 'panel-status-menu-box' });

      //menu bar icon
      let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                                    style_class: 'system-status-icon' });

      hbox.add_child(icon);

      this.actor.add_actor(hbox);


      this._sections = { };

      for (let i=0; i < SECTIONS.length; i++) {
        let id = SECTIONS[i];
        this._sections[id] = new PopupMenu.PopupMenuSection();

        this.menu.addMenuItem(this._sections[id]);

        let menuItem = new ExampleMenuItem({name:SECTIONS[i], icon: new Gio.ThemedIcon({ name: 'drive-harddisk-symbolic' })});

        this._sections[id].addMenuItem(menuItem);

        this._sections[id].actor.visible = true;

      }
    },

    destroy: function() {
      this.parent();
    },

  });

  function init() {

  }

  let _indicator;

  function enable() {
    _indicator = new ExampleMenu;

    let pos = 1; //controls the horizontal position; 1 = 1st left, 2 = 2nd left etc

    Main.panel.addToStatusArea('example-menu', _indicator, pos, 'right');
  }

  function disable() {
    _indicator.destroy();
  }
