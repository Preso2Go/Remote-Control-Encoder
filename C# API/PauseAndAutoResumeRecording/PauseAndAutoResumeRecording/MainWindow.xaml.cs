using System;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Net;
using System.IO;
using System.Web.Script.Serialization;
using System.Security.Cryptography;
using System.ComponentModel;
using System.Configuration;
using System.Reflection;

namespace PauseAndAutoResumeRecording
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// 
    /// C# Example of how to use the Presentations 2Go API for the encoder.
    /// For Documentation, see guthub here: https://github.com/Preso2Go/Remote-Control-Encoder
    /// For Documentation of the API, see this: http://upgrade.presentations2go.eu/p2g.api/Encoder.RemoteControl/APIv3/
    /// For the licence, visit: https://github.com/Preso2Go/Remote-Control-Encoder
    /// 
    /// This example is an application made for the teacher. When the recording is started automatically, and the teacher wants to pause the recording,
    /// he/she will specify the amount of minutes he/she want to pause the recording and presses the pause button. The recording will pause for the specified amount
    /// of minutes and will then automatically resume the recording.
    /// If the pause has to stop early, the teacher can press the resume button and the recording will from then on be resumed.
    /// The teacher can only pause or resume the recording and can NEVER start or stop a recording session. This will have to be done in a different way. For example to schedule the recording.
    /// 
    /// When the user has logged into the application, he/she can pause or resume the recording. The login credentials are encrypted and saved in a local settings file.
    /// When the application is started and the user has logged into the application before, the application tries to automatically login with the last login credentials.
    /// If these are no longer valid, a warning is showed and the user has to login again. 
    /// 
    /// When the user logges in and the recording sotware is currently live, the user will get a error message with more information. The user will have to quit the application 
    /// and stop the live session before he/she can use anything of the application. 
    /// When using this application, you are most likely not live, or thats not meant to be.
    /// </summary>
    public partial class MainWindow : Window
    {
        //Variables used in this application that are able to be user by any function.
        private static int minutespause = 15;
        private static System.Timers.Timer aTimer;
        private static System.Timers.Timer UpdateTimer;
        public string ip;
        public string password;
        private bool timeron = false;
        private int timesec = 0;
        string ssec, smin;
        int currentrecstatus = 0;

        //Initialisation of the application window that will only be called once at the beginning of the application.
        public MainWindow()
        {
            InitializeComponent();
            
            this.DataContext = this;
            resetimer();

            //Initializing all the items in the dropdown menu.
            for (int i = 1; i <= 15; i++)
            {
                string comboboxvalue;
                if (i != 1) comboboxvalue = (i + " minutes");
                else comboboxvalue = (i + " minute");

                cobxNrMinutes.Items.Add(comboboxvalue);
            }

            //The standard selected item in the dropdown is number 14 which is "15 minutes". This is because it starts at 0!
            cobxNrMinutes.SelectedIndex = 14;

            string loc = Assembly.GetEntryAssembly().Location;
            Configuration AppConfiguration = ConfigurationManager.OpenMappedExeConfiguration(
                new ExeConfigurationFileMap { ExeConfigFilename = loc + ".config" }, ConfigurationUserLevel.None);

            var settings = AppConfiguration.AppSettings.Settings;
            string defaultip = Decrypt(settings["Ip"].Value);
            string defaultpassword = Decrypt(settings["Password"].Value);
            //string defaultip = Decrypt(Properties.Settings.Default.Ip);
            //string defaultpassword = Decrypt(Properties.Settings.Default.Password);
            if (defaultip != null && defaultpassword != null)
            {
                ip = defaultip;
                password = defaultpassword;
                this.Title = "Pause recording " + ip;
            }
            
            UpdateRecStatus();

            //Initialises the update timer. This timer checks every 2.5 seconds if something changed.
            //If something changed, it will change the appropriate items in the application.
            UpdateTimer = new System.Timers.Timer();
            UpdateTimer.Interval = 2500; //Interval in miliseconds
            UpdateTimer.Elapsed += OnUpdateRecStatus;
            UpdateTimer.AutoReset = true;
            UpdateTimer.Start();
        }

        //Updates the recording status, and changed the application accordingly.
        private void UpdateRecStatus(bool erroronlive = true)
        {
            string recstatus = getRecordingStatusEncoder(false);
            Application.Current.Dispatcher.Invoke(new Action(() => {
                if (recstatus == "Recording  (Paused) " && currentrecstatus != 1)
                {
                    currentrecstatus = 1;
                    btnPauseResume.IsEnabled = true;
                    cobxNrMinutes.IsEnabled = false;
                    btnPauseResume.Style = (Style)FindResource("BtnResumeStyle");
                }
                else if (recstatus == "Recording " && currentrecstatus != 2)
                {
                    currentrecstatus = 2;
                    resetimer();
                    btnPauseResume.IsEnabled = true;
                    btnPauseResume.Style = (Style)FindResource("BtnPauseStyle");
                }
                else if (recstatus == "Idle" && currentrecstatus != 3)
                {
                    currentrecstatus = 3;
                    resetimer();
                    btnPauseResume.IsEnabled = true;
                    btnPauseResume.Style = (Style)FindResource("BtnBlockedPauseStyle");
                }
                else if (recstatus == "Live" && currentrecstatus != 4)
                {
                    currentrecstatus = 4;
                    resetimer();
                    cobxNrMinutes.IsEnabled = false;
                    btnPauseResume.IsEnabled = false;
                    btnPauseResume.Style = (Style)FindResource("BtnBlockedPauseStyle");
                    if (erroronlive)
                    {
                        MessageBox.Show("The recorder is live. You won't be able to pause the recording while you're live! Please restart this application when you stoped the live session!",
                                        "You're live!",
                                        MessageBoxButton.OK,
                                        MessageBoxImage.Error);
                    }
                }
            }));
        }

        //Every 2.5 seconds, it checks what state the recording is in.
        private void OnUpdateRecStatus(Object source, System.Timers.ElapsedEventArgs e)
        {
            UpdateRecStatus(false);
        }

        //When the user selects a different number of minutes in this software.
        private void cobxNrMinutes_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            //Has to be +1, because the selectedindex starts at 0!
            minutespause = cobxNrMinutes.SelectedIndex+1;
        }

        //When the user clicks on the pause / resume button in this software.
        private void btnPauseResume_Click(object sender, RoutedEventArgs e)
        {
            string recstatus = getRecordingStatusEncoder();
            
            if (recstatus == "Recording  (Paused) ")
            {
                if(aTimer != null)
                {
                    aTimer.Dispose();
                }
                pressPauseResumeBtn();
                resetimer();

            }
            else if(recstatus == "Recording ")
            {
                pressPauseResumeBtn();

                Console.WriteLine("Timer Started!");

                string mins;
                if (minutespause < 10) mins = "0" + minutespause.ToString();
                else mins = minutespause.ToString();

                MyTextBlock.Text = mins + ":00 until resuming!";

                cobxNrMinutes.IsEnabled = false;
                timeron = true;
                aTimer = new System.Timers.Timer();
                aTimer.Interval = 1000; //minutespause in miliseconds
                aTimer.Elapsed += OnTimedEvent;
                aTimer.AutoReset = true;
                aTimer.Start();
            }
            else if (recstatus == "Idle")
            {
                MessageBox.Show("You are currently not recording. \nYou have to start a recording session before you pause it!",
                                    "Not recording!", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Exclamation);
            }
            else if (recstatus == "Live")
            {
                MessageBox.Show("You are currently live! \nYou can't pause the recording while you're live!", 
                                    "You're live!", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Exclamation);
            }
        }

        // When the specified time is over, this function will be called.
        private void OnTimedEvent(Object source, System.Timers.ElapsedEventArgs e)
        {
            if (timesec >= (minutespause * 60))
            {
                if (getRecordingStatusEncoder() == "Recording  (Paused) ")
                {
                    timeron = false;
                    Console.WriteLine("Timer Stoped!");
                    pressPauseResumeBtn();
                    resetimer();
                }
            }
            else
            {
                timesec += 1;
                float fulltimeminustimedseconds = ((minutespause * 60) - timesec);
                int minutes = (int)(fulltimeminustimedseconds / 60);
                int seconds = (int)(fulltimeminustimedseconds - (minutes * 60));
                if (minutes < 10) smin = "0" + minutes.ToString();
                else smin = minutes.ToString();
                if (seconds < 10) ssec = "0" + seconds.ToString();
                else ssec = seconds.ToString();

                Application.Current.Dispatcher.Invoke(new Action(() => {
                   MyTextBlock.Text = (smin + ":" + ssec + " until resuming!"); 
                }));
            }
        }

        //Reset variables that are used with the timer
        public void resetimer()
        {
            if(aTimer != null) aTimer.Dispose();
            Application.Current.Dispatcher.Invoke(new Action(() => {
                MyTextBlock.Text = "";
                cobxNrMinutes.IsEnabled = true;
                timesec = 0;
                timeron = false;
            }));
        }

        //Sends a request to the encoder and returns the state of the recording. 
        private string getRecordingStatusEncoder(bool errormsg = true)
        {
            try {
                WebRequest request = WebRequest.Create("http://" + ip + "?action=info&actionDetail=status&user=presentations2go&password=" + password + "&sessionId=" + getSessionId());
                request.Credentials = new NetworkCredential(" ", " ");

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream dataStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                string responseFromServer = reader.ReadToEnd();
                var serializer = new JavaScriptSerializer();
                var json = serializer.Deserialize<dynamic>(responseFromServer);
                reader.Close();
                dataStream.Close();
                response.Close();

                return json["configurations"][0]["value"];
            }
            catch
            {
                if (errormsg)
                {
                    MessageBox.Show("ERROR: An error occured while trying to connect to the encoder!\nPlease check your internet connection and the internet connection of the encoder, if that does not help, please contact an administrator.",
                                    "Error",
                                    MessageBoxButton.OK,
                                    MessageBoxImage.Warning);
                }
                return null;
            }

        }

        //Opens the login screen and closes this screen. Not used anymore!
        /*private void gotoLoginScreen(bool logout = false)
        {
            login loginscreen;
            if (logout)
            {
                loginscreen = new login(false);
            }else loginscreen = new login(true);
            loginscreen.Show();
            this.Close();
        }*/

        //Presses the Record / Pause / Resume button in the encoder. 
        private void pressPauseResumeBtn()
        {
            try
            {
                WebRequest request = WebRequest.Create("http://" + ip + "?action=sendcommand&actionDetail=Startpause&user=presentations2go&password=" + password + "&sessionId=" + getSessionId());
                request.Credentials = new NetworkCredential(" ", " ");

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream dataStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                string responseFromServer = reader.ReadToEnd();
                var serializer = new JavaScriptSerializer();
                var json = serializer.Deserialize<dynamic>(responseFromServer);

                reader.Close();
                dataStream.Close();
                response.Close();

                if (btnPauseResume.Style == (Style)FindResource("BtnResumeStyle")){
                    btnPauseResume.Style = (Style)FindResource("BtnPauseStyle");
                    currentrecstatus = 2;
                }
                else
                {
                    btnPauseResume.Style = (Style)FindResource("BtnResumeStyle");
                    currentrecstatus = 1;
                }
            }
            catch
            {
                MessageBox.Show("ERROR: An error occured while trying to connect to the encoder!\nPlease check your internet connection and the internet connection of the encoder, if that does not help, please contact an administrator.",
                                    "Error",
                                    MessageBoxButton.OK,
                                    MessageBoxImage.Warning);
            }
            
        }

        //Returns a new valid sessionId. This has to be done when trying to doing something in the encoder with the API.
        private string getSessionId(bool login = false)
        {
            try {
                WebRequest request = WebRequest.Create("http://" + ip + "?action=sendcommand&actiondetail=initializeremotecontrol&user=presentations2go&password=" + password);
                request.Credentials = new NetworkCredential(" ", " ");

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream dataStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                string responseFromServer = reader.ReadToEnd();
                var serializer = new JavaScriptSerializer();
                var json = serializer.Deserialize<dynamic>(responseFromServer);
                reader.Close();
                dataStream.Close();
                response.Close();
                if (login)
                {
                    try{
                        return json["errorMessage"];
                    }
                    catch (System.Collections.Generic.KeyNotFoundException){
                        return json["sessionId"];
                    }
                }
                else return json["sessionId"];
            }
            catch
            {
                MessageBox.Show("ERROR: An error occured while trying to connect to the encoder!\nPlease check your internet connection and the internet connection of the encoder, if that does not help, please contact an administrator.",
                                    "Error",
                                    MessageBoxButton.OK,
                                    MessageBoxImage.Warning);
                return null;
            }

        }

        //When the logout button is pressed, the user will get redirected to the login screen. Logout button is currently not used anymore.
        /*private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            if (timeron)
            {
                MessageBoxResult result = MessageBox.Show("Are you sure you want to logout while you pause the recording? This will mean the timer is deleted and the recording won't start automatically anymore!!",
                                                            "Logout while paused?",
                                                            MessageBoxButton.YesNo,
                                                            MessageBoxImage.Warning);
                if(result == MessageBoxResult.Yes)
                {
                    aTimer.Dispose();
                    resetimer();
                    gotoLoginScreen(true);
                }
            }
            else
            {
                gotoLoginScreen(true);
            }
        }*/

        //When the application is tried to be closed and the user had pressed the pause button and so the timer is on, it asks if you are sure if you want to close the application. 
        private void CloseBtnEvent(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (timeron)
            {
                MessageBoxResult result = MessageBox.Show("You are currently paused, you will have to wait until the recording is continued before you can close this application!",
                                                            "Can't close while paused!",
                                                            MessageBoxButton.OK,
                                                            MessageBoxImage.Error);
                e.Cancel = true;
            }
        }


        // Encryption of the ip and password used in the application.
        // This constant string is used as a "salt" value for the PasswordDeriveBytes function calls.
        // This size of the IV (in bytes) must = (keysize / 8).  Default keysize is 256, so the IV must be
        // 32 bytes long.  Using a 16 character string here gives us 32 bytes when converted to a byte array.
        private static readonly byte[] initVectorBytes = Encoding.ASCII.GetBytes("_!_!_P2GOP!w_!_@");

        // This constant is used to determine the keysize of the encryption algorithm.
        private const int keysize = 256;

        //Encrypt playText with the passPhrase password.
        private static string Encrypt(string plainText, string passPhrase = "Pr3s3ntAtions2GOEncr1pt1onP@sswordWh1chIsV3ryStr0ngC@nYouSeeThat?")
        {
            try
            {
                byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
                using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null))
                {
                    byte[] keyBytes = password.GetBytes(keysize / 8);
                    using (RijndaelManaged symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.Mode = CipherMode.CBC;
                        using (ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes))
                        {
                            using (MemoryStream memoryStream = new MemoryStream())
                            {
                                using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                                {
                                    cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                    cryptoStream.FlushFinalBlock();
                                    byte[] cipherTextBytes = memoryStream.ToArray();
                                    return Convert.ToBase64String(cipherTextBytes);
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        //Decrypt cipherText with the passPhrase password.
        private static string Decrypt(string cipherText, string passPhrase = "Pr3s3ntAtions2GOEncr1pt1onP@sswordWh1chIsV3ryStr0ngC@nYouSeeThat?")
        {
            try
            {
                byte[] cipherTextBytes = Convert.FromBase64String(cipherText);
                using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null))
                {
                    byte[] keyBytes = password.GetBytes(keysize / 8);
                    using (RijndaelManaged symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.Mode = CipherMode.CBC;
                        using (ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes))
                        {
                            using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes))
                            {
                                using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                                {
                                    byte[] plainTextBytes = new byte[cipherTextBytes.Length];
                                    int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                    return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }
    }
}
