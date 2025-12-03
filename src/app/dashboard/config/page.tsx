"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/language-selector";
import { API_BASE_URL } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Key,
  Cloud,
  Database,
  Zap,
  Loader,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Trash2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Language, t } from "@/lib/translations";

interface CloudflareConfig {
  apiToken: string;
  accountId: string;
  d1Database: string;
  workerApi: string;
  kvStorage: string;
  destinationEmails?: string[];
}

export default function CloudflareConfigDashboard() {
  const [language, setLanguage] = useState<Language>("id");
  const [config, setConfig] = useState<CloudflareConfig>({
    apiToken: "",
    accountId: "",
    d1Database: "",
    workerApi: "",
    kvStorage: "",
    destinationEmails: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState({
    apiToken: false,
    accountId: false,
    d1Database: false,
    workerApi: false,
    kvStorage: false,
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<CloudflareConfig>({
    apiToken: "",
    accountId: "",
    d1Database: "",
    workerApi: "",
    kvStorage: "",
    destinationEmails: [],
  });
  const [newEmail, setNewEmail] = useState("");

  // Load config on mount
  useEffect(() => {
    loadConfig();
    // Load language preference
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cloudflare/config`);
      const data = await response.json();

      if (data.success && data.config && data.config._full) {
        const fullConfig = data.config._full;
        setConfig(fullConfig);
        setTempConfig(fullConfig);
        setIsConfigured(true);
      }
    } catch (error) {
      console.error("Error loading config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleSaveConfig = async () => {
    // Validasi input
    if (
      !tempConfig.apiToken ||
      !tempConfig.accountId ||
      !tempConfig.d1Database ||
      !tempConfig.workerApi ||
      !tempConfig.kvStorage
    ) {
      toast.error(t("Semua field harus diisi", language));
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/cloudflare/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...tempConfig,
          destinationEmails: tempConfig.destinationEmails || [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig(tempConfig);
        setIsConfigured(true);
        setDialogOpen(false);
        setNewEmail("");
        // Reload config to get latest data
        await loadConfig();
        toast.success(t("Konfigurasi berhasil disimpan!", language));
      } else {
        toast.error(data.error || t("Gagal menyimpan konfigurasi", language));
      }
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error(t("Gagal menyimpan konfigurasi", language));
    } finally {
      setSaving(false);
    }
  };

  const handleAddEmail = () => {
    const emailTrim = newEmail.trim().toLowerCase();
    
    if (!emailTrim) {
      toast.error(t("Masukkan email tujuan", language));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      toast.error(t("Format email tidak valid", language));
      return;
    }

    if (tempConfig.destinationEmails?.includes(emailTrim)) {
      toast.error(t("Email sudah ditambahkan", language));
      return;
    }

    const updatedEmails = [...(tempConfig.destinationEmails || []), emailTrim];
    setTempConfig({
      ...tempConfig,
      destinationEmails: updatedEmails,
    });
    setNewEmail("");
    toast.success(t("Email ditambahkan", language));
  };

  const handleRemoveEmail = (email: string) => {
    const updatedEmails = (tempConfig.destinationEmails || []).filter(e => e !== email);
    setTempConfig({
      ...tempConfig,
      destinationEmails: updatedEmails,
    });
    toast.success(t("Email dihapus", language));
  };

  const toggleShowValue = (field: keyof typeof showValues) => {
    setShowValues((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} ${t("disalin ke clipboard", language)}`);
  };

  const openEditDialog = async () => {
    // Reload config untuk memastikan data terbaru
    try {
      const response = await fetch(`${API_BASE_URL}/api/cloudflare/config`);
      const data = await response.json();
      
      if (data.success && data.config && data.config._full) {
        setTempConfig(data.config._full);
        setNewEmail("");
      } else {
        setTempConfig(config);
      }
    } catch (error) {
      setTempConfig(config);
    }
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-1.5 rounded-lg flex-shrink-0">
              <Cloud className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {t("Cloudflare Config", language)}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5 hidden sm:block truncate">
                {t("Kelola konfigurasi API Cloudflare Anda", language)}
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex-shrink-0">
            <LanguageSelector currentLanguage={language} onLanguageChange={handleLanguageChange} />
          </div>
        </div>

        {/* Status Card */}
        <Card className="mb-4 sm:mb-5 border-0 shadow-lg">
          <CardContent className="p-3 sm:p-4 pt-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                {isConfigured ? (
                  <>
                    <div className="bg-green-100 dark:bg-green-900 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("Status", language)}
                      </p>
                      <p className="text-xs sm:text-base font-semibold text-green-600 dark:text-green-400">
                        {t("Konfigurasi Tersimpan", language)}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t("Status", language)}
                      </p>
                      <p className="text-xs sm:text-base font-semibold text-yellow-600 dark:text-yellow-400">
                        {t("Belum Ada Konfigurasi", language)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-xs sm:text-sm h-9 sm:h-10"
                    onClick={openEditDialog}
                  >
                    <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    {isConfigured ? t("Edit Konfigurasi", language) : t("Setup Sekarang", language)}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto text-xs sm:text-sm">
                  <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">
                      {isConfigured
                        ? t("Edit Konfigurasi Cloudflare", language)
                        : t("Setup Konfigurasi Cloudflare", language)}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      {t(
                        "Masukkan semua API key yang diperlukan. Data akan disimpan secara aman.",
                        language
                      )}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 py-3">
                    {/* API Token */}
                    <div className="space-y-1.5">
                      <Label htmlFor="apiToken" className="text-xs sm:text-sm font-semibold">
                        {t("Cloudflare API Token", language)}
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("Token API untuk autentikasi", language)}
                      </p>
                      <div className="flex gap-1.5 flex-col sm:flex-row">
                        <Input
                          id="apiToken"
                          type={showValues.apiToken ? "text" : "password"}
                          placeholder="DaUhMVKy4ZEMwwG3UF9kPdF7L4DtzYp65HZlf4Sl"
                          value={tempConfig.apiToken}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, apiToken: e.target.value })
                          }
                          className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleShowValue("apiToken")}
                          className="h-8 sm:h-9 w-8 sm:w-9 flex-shrink-0"
                        >
                          {showValues.apiToken ? (
                            <EyeOff className="w-3 sm:w-4 h-3 sm:h-4" />
                          ) : (
                            <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Account ID */}
                    <div className="space-y-2">
                      <Label htmlFor="accountId" className="text-base font-semibold">
                        {t("Account ID", language)}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t("ID akun Cloudflare Anda", language)}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="accountId"
                          type={showValues.accountId ? "text" : "password"}
                          placeholder="cd83bf9065a6d97b76cf390d8b1ae1ed"
                          value={tempConfig.accountId}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, accountId: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleShowValue("accountId")}
                        >
                          {showValues.accountId ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* D1 Database */}
                    <div className="space-y-2">
                      <Label htmlFor="d1Database" className="text-base font-semibold">
                        {t("D1 Database ID", language)}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t("ID database D1 Cloudflare", language)}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="d1Database"
                          type={showValues.d1Database ? "text" : "password"}
                          placeholder="ba9f6de9-78cf-4e21-93c3-cc1c1a14e18f"
                          value={tempConfig.d1Database}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, d1Database: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleShowValue("d1Database")}
                        >
                          {showValues.d1Database ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Worker API */}
                    <div className="space-y-2">
                      <Label htmlFor="workerApi" className="text-base font-semibold">
                        {t("Worker API Token", language)}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t("Token untuk Cloudflare Worker", language)}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="workerApi"
                          type={showValues.workerApi ? "text" : "password"}
                          placeholder="gNM_ATjIHt7sjRBCRjJEwwHTq5p2jRJQcVUJr305"
                          value={tempConfig.workerApi}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, workerApi: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleShowValue("workerApi")}
                        >
                          {showValues.workerApi ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* KV Storage */}
                    <div className="space-y-2">
                      <Label htmlFor="kvStorage" className="text-base font-semibold">
                        {t("KV Storage ID", language)}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t("ID KV Storage Cloudflare", language)}
                      </p>
                      <div className="flex gap-2">
                        <Input
                          id="kvStorage"
                          type={showValues.kvStorage ? "text" : "password"}
                          placeholder="fc9664c85b18483392ceffe43293ca12"
                          value={tempConfig.kvStorage}
                          onChange={(e) =>
                            setTempConfig({ ...tempConfig, kvStorage: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => toggleShowValue("kvStorage")}
                        >
                          {showValues.kvStorage ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Destination Emails */}
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        {t("Daftar Email Tujuan", language)}
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {t("Kelola alamat email tujuan yang akan menerima email", language)}
                      </p>

                      <div className="flex gap-2 mb-4 flex-col sm:flex-row">
                        <Input
                          type="email"
                          placeholder={t("Masukkan email tujuan", language)}
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddEmail();
                            }
                          }}
                          className="flex-1 text-xs sm:text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddEmail}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-0 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                          <span className="sm:hidden">{t("Add", language)}</span>
                          <span className="hidden sm:inline">{t("Tambah", language)}</span>
                        </Button>
                      </div>

                      {tempConfig.destinationEmails && tempConfig.destinationEmails.length > 0 ? (
                        <div className="space-y-2">
                          {tempConfig.destinationEmails.map((email) => (
                            <div
                              key={email}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 sm:p-3 rounded-md gap-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <Mail className="w-3 sm:w-4 h-3 sm:h-4 text-blue-500 flex-shrink-0" />
                                <span className="font-mono text-xs sm:text-sm truncate">{email}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveEmail(email)}
                                className="w-full sm:w-auto text-red-600 hover:text-red-700 text-xs sm:text-sm h-8 sm:h-9"
                              >
                                <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                                <span className="sm:hidden">{t("Hapus", language)}</span>
                                <span className="hidden sm:inline">{t("Delete", language)}</span>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                          {t("Tidak ada email tujuan", language)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={saving}
                    >
                      {t("Batal", language)}
                    </Button>
                    <Button
                      onClick={handleSaveConfig}
                      disabled={saving}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                    >
                      {saving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          {t("Memproses...", language)}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          {t("Simpan Konfigurasi", language)}
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Cards */}
        {isConfigured && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* API Token Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <CardTitle className="text-sm">API Token</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("Tersimpan", language)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("Cloudflare API Token", language)}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>
                      {showValues.apiToken ? config.apiToken : "•".repeat(config.apiToken.length)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.apiToken, "API Token")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account ID Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-orange-500" />
                    <CardTitle className="text-sm">Account ID</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("Tersimpan", language)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("ID akun Cloudflare Anda", language)}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>
                      {showValues.accountId ? config.accountId : "•".repeat(config.accountId.length)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.accountId, "Account ID")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* D1 Database Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-sm">D1 Database</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("Tersimpan", language)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("ID database D1 Cloudflare", language)}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>
                      {showValues.d1Database
                        ? config.d1Database
                        : "•".repeat(config.d1Database.length)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.d1Database, "D1 Database")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Worker API Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    <CardTitle className="text-sm">Worker API</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("Tersimpan", language)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("Token untuk Cloudflare Worker", language)}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>
                      {showValues.workerApi ? config.workerApi : "•".repeat(config.workerApi.length)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.workerApi, "Worker API")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KV Storage Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-sm">KV Storage</CardTitle>
                  </div>
                  <Badge variant="secondary">{t("Tersimpan", language)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("ID KV Storage Cloudflare", language)}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-sm flex items-center justify-between">
                    <span>
                      {showValues.kvStorage ? config.kvStorage : "•".repeat(config.kvStorage.length)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(config.kvStorage, "KV Storage")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destination Emails Card */}
            {config.destinationEmails && config.destinationEmails.length > 0 && (
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow md:col-span-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-500" />
                      <CardTitle className="text-sm">{t("Daftar Email Tujuan", language)}</CardTitle>
                    </div>
                    <Badge variant="secondary">{config.destinationEmails.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {config.destinationEmails.map((email) => (
                      <div
                        key={email}
                        className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md flex items-center justify-between"
                      >
                        <span className="font-mono text-sm">{email}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(email, "Email")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
