namespace ChocoPlayer.Properties
{
    internal sealed partial class Settings : global::System.Configuration.ApplicationSettingsBase
    {
        private static Settings defaultInstance = ((Settings)(global::System.Configuration.ApplicationSettingsBase.Synchronized(new Settings())));

        public static Settings Default
        {
            get
            {
                return defaultInstance;
            }
        }

        [global::System.Configuration.UserScopedSettingAttribute()]
        [global::System.Configuration.DefaultSettingValueAttribute("False")]
        public bool IsMiniMode
        {
            get
            {
                return ((bool)(this["IsMiniMode"]));
            }
            set
            {
                this["IsMiniMode"] = value;
            }
        }

        [global::System.Configuration.UserScopedSettingAttribute()]
        [global::System.Configuration.DefaultSettingValueAttribute("")]
        public string PreferredAudioLanguage
        {
            get
            {
                return ((string)(this["PreferredAudioLanguage"]));
            }
            set
            {
                this["PreferredAudioLanguage"] = value;
            }
        }

        [global::System.Configuration.UserScopedSettingAttribute()]
        [global::System.Configuration.DefaultSettingValueAttribute("")]
        public string PreferredSubtitleLanguage
        {
            get
            {
                return ((string)(this["PreferredSubtitleLanguage"]));
            }
            set
            {
                this["PreferredSubtitleLanguage"] = value;
            }
        }
    }
}