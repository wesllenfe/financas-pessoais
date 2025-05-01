import type { CapacitorConfig } from "@capacitor/cli"

const config: CapacitorConfig = {
  appId: "io.ionic.financasapp",
  appName: "Finanças Pessoais",
  webDir: "www",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3880ff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#3880ff",
    },
  },
}

export default config
