#import <Cordova/CDV.h>
#import <FullStory/FullStory.h>

@interface FullstoryPlugin : CDVPlugin
@end

@implementation FullstoryPlugin

- (void)restart:(CDVInvokedUrlCommand *)command {
    [FS restart];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)shutdown:(CDVInvokedUrlCommand *)command {
    [FS shutdown];
    CDVPluginResult *result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

@end
