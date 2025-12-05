"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Key, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  TestTube,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Language, t } from "@/lib/translations";
import { useRouter } from "next/navigation";

interface SystemSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  description?: string;
  is_encrypted: boolean;
}

interface ConnectionTest {
  success: boolean;
  message: string;
  tests?: {
    anonKey: { success: boolean; message: string };
    serviceKey: { success: boolean; message: string };
  };
}

export default function SupabaseConfigPage() {
  const [language, setLanguage] = useState<Language>("id");
  const [settings, setSettings] = useState<SystemSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [connectionTest, setConnectionTest] = useState<ConnectionTest | null>(null);
  const router = useRouter();

  // Form states
  const [formData, setFormData] = useState({
    supabase_url: '',
    supabase_anon_key: '',
    supabase_service_key: '',
    app_name: 'Email Routing Manager',
    app_version: '2.0.0'
  });

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/system-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
        
        // Populate form dengan existing values
        const formValues: any = {};
        data.settings.forEach((setting: SystemSettings) => {
          if (setting.setting_key !== 'supabase_service_key' || setting.setting_value !== '***ENCRYPTED***') {
            formValues[setting.setting_key] = setting.setting_value;
          }
        });
        
        setFormData(prev => ({ ...prev, ...formValues }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const testConnection = async () => {
    setTesting(true);
    setConnectionTest(null);

    try {
      const response = await fetch('/api/test-supabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supabaseUrl: formData.supabase_url,
          supabaseAnonKey: formData.supabase_anon_key,
          supabaseServiceKey: formData.supabase_service_key
        })
      });

      const result = await response.json();
      setConnectionTest(result);

      if (result.success) {
        toast.success('Koneksi Supabase berhasil!');
      } else {
        toast.error('Koneksi Supabase gagal: ' + result.error);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Gagal melakukan test koneksi');
      setConnectionTest({
        success: false,
        message: 'Internal server error'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: formData
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Pengaturan berhasil disimpan!');
        
        // Refresh data untuk memastikan data terbaru
        await fetchSettings();
        
        // Jika berhasil menyimpan ke Supabase, refresh Supabase client
        if (result.message.includes('Supabase')) {
          // Force refresh untuk memastikan data ter-load dari Supabase
          window.location.reload();
        }
      } else {
        toast.error('Gagal menyimpan pengaturan: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (isEncrypted: boolean) => {
    return isEncrypted ? (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Shield className="w-3 h-3 mr-1" />
        Encrypted
      </Badge>
    ) : (
      <Badge variant="outline">
        <Key className="w-3 h-3 mr-1" />
        Plain
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                <Database className="w-8 h-8 inline mr-2" />
                {t("Supabase Configuration", language)}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {t("Kelola konfigurasi database Supabase dan API keys", language)}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              ← {t("Kembali ke Dashboard", language)}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="supabase" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="supabase">Supabase Config</TabsTrigger>
            <TabsTrigger value="test">Connection Test</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Supabase Configuration Tab */}
          <TabsContent value="supabase">
            <Alert className="mb-4 border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Setup Instructions:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                  <li>Create a new project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                  <li>Go to SQL Editor and run the schema from <code>supabase-schema.sql</code></li>
                  <li>Get your API keys from Project Settings → API</li>
                  <li>Fill in the configuration below and test the connection</li>
                </ol>
              </AlertDescription>
            </Alert>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t("Supabase Database Configuration", language)}
                </CardTitle>
                <CardDescription>
                  {t("Konfigurasi koneksi ke database Supabase Anda", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Supabase URL */}
                <div className="space-y-2">
                  <Label htmlFor="supabase_url">
                    {t("Supabase Project URL", language)}
                  </Label>
                  <Input
                    id="supabase_url"
                    type="url"
                    value={formData.supabase_url}
                    onChange={(e) => handleInputChange('supabase_url', e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="font-mono"
                  />
                  <p className="text-sm text-slate-500">
                    {t("URL project Supabase Anda", language)}
                  </p>
                </div>

                {/* Anonymous Key */}
                <div className="space-y-2">
                  <Label htmlFor="supabase_anon_key">
                    {t("Anonymous Key", language)}
                  </Label>
                  <div className="relative">
                    <Input
                      id="supabase_anon_key"
                      type={showSecrets.supabase_anon_key ? "text" : "password"}
                      value={formData.supabase_anon_key}
                      onChange={(e) => handleInputChange('supabase_anon_key', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="font-mono pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => toggleSecretVisibility('supabase_anon_key')}
                    >
                      {showSecrets.supabase_anon_key ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                    {t("Key anonim Supabase untuk akses publik", language)}
                  </p>
                </div>

                {/* Service Role Key */}
                <div className="space-y-2">
                  <Label htmlFor="supabase_service_key">
                    {t("Service Role Key", language)}
                    <Badge variant="destructive" className="ml-2">
                      <Shield className="w-3 h-3 mr-1" />
                      {t("Sensitive", language)}
                    </Badge>
                  </Label>
                  <div className="relative">
                    <Input
                      id="supabase_service_key"
                      type={showSecrets.supabase_service_key ? "text" : "password"}
                      value={formData.supabase_service_key}
                      onChange={(e) => handleInputChange('supabase_service_key', e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="font-mono pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => toggleSecretVisibility('supabase_service_key')}
                    >
                      {showSecrets.supabase_service_key ? (
                        <EyeOff className="h-4 w-4 text-slate-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-500" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500">
                    {t("Key service role Supabase untuk akses admin (simpan dengan aman)", language)}
                  </p>
                </div>

                {/* App Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="app_name">
                      {t("Application Name", language)}
                    </Label>
                    <Input
                      id="app_name"
                      value={formData.app_name}
                      onChange={(e) => handleInputChange('app_name', e.target.value)}
                      placeholder="Email Routing Manager"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="app_version">
                      {t("Application Version", language)}
                    </Label>
                    <Input
                      id="app_version"
                      value={formData.app_version}
                      onChange={(e) => handleInputChange('app_version', e.target.value)}
                      placeholder="2.0.0"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={saveSettings}
                    disabled={saving}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{t("Menyimpan...", language)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>{t("Simpan Pengaturan", language)}</span>
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Connection Test Tab */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="w-5 h-5" />
                  {t("Connection Test", language)}
                </CardTitle>
                <CardDescription>
                  {t("Test koneksi ke database Supabase", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  onClick={testConnection}
                  disabled={testing || !formData.supabase_url || !formData.supabase_anon_key}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {testing ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t("Testing...", language)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <TestTube className="w-4 h-4" />
                      <span>{t("Test Koneksi", language)}</span>
                    </div>
                  )}
                </Button>

                {connectionTest && (
                  <Alert className={connectionTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <div className="flex items-center gap-2">
                      {connectionTest.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={connectionTest.success ? "text-green-800" : "text-red-800"}>
                        <strong>{t("Connection Test Result:", language)}</strong> {connectionTest.message}
                        {connectionTest.suggestion && (
                          <div className="mt-2 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
                            <strong>Suggestion:</strong> {connectionTest.suggestion}
                          </div>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {connectionTest?.tests && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">{t("Detailed Test Results:", language)}</h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {connectionTest.tests.anonKey.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{t("Anonymous Key:", language)}</span>
                        <span className={connectionTest.tests.anonKey.success ? "text-green-600" : "text-red-600"}>
                          {connectionTest.tests.anonKey.message}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {connectionTest.tests.serviceKey.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{t("Service Key:", language)}</span>
                        <span className={connectionTest.tests.serviceKey.success ? "text-green-600" : "text-red-600"}>
                          {connectionTest.tests.serviceKey.message}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t("Advanced Settings", language)}
                </CardTitle>
                <CardDescription>
                  {t("Pengaturan lanjutan dan status sistem", language)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">{t("Current System Settings:", language)}</h4>
                  
                  {settings.map((setting) => (
                    <div key={setting.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                            {setting.setting_key}
                          </code>
                          {getStatusBadge(setting.is_encrypted)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{setting.description}</p>
                      <div className="text-xs text-slate-500">
                        {t("Value", language)}: {setting.is_encrypted ? '***ENCRYPTED***' : setting.setting_value}
                      </div>
                    </div>
                  ))}
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {t("Pastikan untuk menjaga kerahasiaan API keys dan tidak membagikannya ke pihak tidak berwenang.", language)}
                  </AlertDescription>
                </Alert>

                {/* Debug Information */}
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <h5 className="font-semibold mb-2">Debug Information</h5>
                  <div className="text-xs text-slate-600 space-y-1">
                    <p><strong>Data Source:</strong> {settings.length > 0 && settings[0].id !== '1' ? 'Supabase Database' : 'Environment Variables'}</p>
                    <p><strong>Total Settings:</strong> {settings.length}</p>
                    <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}