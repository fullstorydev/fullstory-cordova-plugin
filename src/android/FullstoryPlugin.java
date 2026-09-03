package com.fullstory.cordova.plugin;

import com.fullstory.FS;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

public class FullstoryPlugin extends CordovaPlugin {
    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if ("restart".equals(action)) {
            FS.restart();
            callbackContext.success();
            return true;
        }

        if ("shutdown".equals(action)) {
            FS.shutdown();
            callbackContext.success();
            return true;
        }

        return false;
    }
}
