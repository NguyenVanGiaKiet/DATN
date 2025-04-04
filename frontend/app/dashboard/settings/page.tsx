"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"

interface Settings {
  general: {
    companyName: string
    logo: string
    address: string
    phone: string
    email: string
    contactInfo: string
  }
  email: {
    smtpServer: string
    smtpPort: string
    smtpUsername: string
    smtpPassword: string
    notificationEmail: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    enable2FA: boolean
    passwordRules: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  notifications: {
    enableEmail: boolean
    enablePush: boolean
    events: {
      newOrder: boolean
      lowStock: boolean
      paymentDue: boolean
      systemAlert: boolean
    }
  }
  integrations: {
    apiKey: string
    webhookUrl: string
    services: {
      name: string
      enabled: boolean
      apiKey: string
    }[]
  }
  backup: {
    autoBackup: boolean
    backupSchedule: string
    backupLocation: string
    retentionDays: number
  }
  display: {
    language: string
    timezone: string
    dateFormat: string
    currencyFormat: string
  }
  printing: {
    invoiceTemplate: string
    receiptTemplate: string
    header: string
    footer: string
  }
}

const defaultSettings: Settings = {
  general: {
    companyName: "",
    logo: "",
    address: "",
    phone: "",
    email: "",
    contactInfo: "",
  },
  email: {
    smtpServer: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    notificationEmail: "",
  },
  security: {
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enable2FA: false,
    passwordRules: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },
  notifications: {
    enableEmail: true,
    enablePush: true,
    events: {
      newOrder: true,
      lowStock: true,
      paymentDue: true,
      systemAlert: true,
    },
  },
  integrations: {
    apiKey: "",
    webhookUrl: "",
    services: [],
  },
  backup: {
    autoBackup: true,
    backupSchedule: "daily",
    backupLocation: "local",
    retentionDays: 30,
  },
  display: {
    language: "vi",
    timezone: "Asia/Ho_Chi_Minh",
    dateFormat: "dd/MM/yyyy",
    currencyFormat: "VND",
  },
  printing: {
    invoiceTemplate: "default",
    receiptTemplate: "default",
    header: "",
    footer: "",
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5190/api/settings")
      if (!response.ok) {
        throw new Error("Không thể tải cài đặt")
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Lỗi khi tải cài đặt:", error)
      toast.error("Không thể tải cài đặt. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: keyof Settings) => {
    try {
      setSaving(true)
      const response = await fetch(`http://localhost:5190/api/settings/${section}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings[section]),
      })

      if (!response.ok) {
        throw new Error("Không thể lưu cài đặt")
      }

      toast.success("Cài đặt đã được lưu thành công")
    } catch (error) {
      console.error("Lỗi khi lưu cài đặt:", error)
      toast.error("Không thể lưu cài đặt. Vui lòng thử lại sau.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
          <TabsTrigger value="email">Cài đặt email</TabsTrigger>
          <TabsTrigger value="security">Bảo mật</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
          <TabsTrigger value="integrations">Tích hợp</TabsTrigger>
          <TabsTrigger value="backup">Sao lưu</TabsTrigger>
          <TabsTrigger value="display">Hiển thị</TabsTrigger>
          <TabsTrigger value="printing">In ấn</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt chung</CardTitle>
              <CardDescription>Cấu hình thông tin cơ bản của công ty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Tên công ty</Label>
                  <Input
                    id="companyName"
                    value={settings.general.companyName}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, companyName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          setSettings({
                            ...settings,
                            general: { ...settings.general, logo: event.target?.result as string },
                          })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    value={settings.general.address}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, address: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={settings.general.phone}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.general.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Thông tin liên hệ</Label>
                  <Textarea
                    id="contactInfo"
                    value={settings.general.contactInfo}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        general: { ...settings.general, contactInfo: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("general")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt email</CardTitle>
              <CardDescription>Cấu hình máy chủ email và thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={settings.email.smtpServer}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, smtpServer: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.email.smtpPort}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">SMTP Username</Label>
                  <Input
                    id="smtpUsername"
                    value={settings.email.smtpUsername}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, smtpUsername: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPassword: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Email thông báo</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={settings.email.notificationEmail}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, notificationEmail: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("email")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bảo mật</CardTitle>
              <CardDescription>Cấu hình các thiết lập bảo mật hệ thống</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Thời gian hết hạn phiên (phút)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Số lần đăng nhập sai tối đa</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, maxLoginAttempts: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enable2FA">Bật xác thực 2 yếu tố</Label>
                  <Switch
                    id="enable2FA"
                    checked={settings.security.enable2FA}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, enable2FA: checked },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quy tắc mật khẩu</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordRules.requireUppercase}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordRules: {
                                ...settings.security.passwordRules,
                                requireUppercase: checked,
                              },
                            },
                          })
                        }
                      />
                      <Label>Yêu cầu chữ hoa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordRules.requireLowercase}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordRules: {
                                ...settings.security.passwordRules,
                                requireLowercase: checked,
                              },
                            },
                          })
                        }
                      />
                      <Label>Yêu cầu chữ thường</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordRules.requireNumbers}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordRules: {
                                ...settings.security.passwordRules,
                                requireNumbers: checked,
                              },
                            },
                          })
                        }
                      />
                      <Label>Yêu cầu số</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={settings.security.passwordRules.requireSpecialChars}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            security: {
                              ...settings.security,
                              passwordRules: {
                                ...settings.security.passwordRules,
                                requireSpecialChars: checked,
                              },
                            },
                          })
                        }
                      />
                      <Label>Yêu cầu ký tự đặc biệt</Label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("security")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt thông báo</CardTitle>
              <CardDescription>Cấu hình các loại thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bật thông báo email</Label>
                  <Switch
                    checked={settings.notifications.enableEmail}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, enableEmail: checked },
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Bật thông báo đẩy</Label>
                  <Switch
                    checked={settings.notifications.enablePush}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, enablePush: checked },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Các sự kiện thông báo</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Đơn hàng mới</Label>
                      <Switch
                        checked={settings.notifications.events.newOrder}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              events: {
                                ...settings.notifications.events,
                                newOrder: checked,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Hàng tồn kho thấp</Label>
                      <Switch
                        checked={settings.notifications.events.lowStock}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              events: {
                                ...settings.notifications.events,
                                lowStock: checked,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Thanh toán đến hạn</Label>
                      <Switch
                        checked={settings.notifications.events.paymentDue}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              events: {
                                ...settings.notifications.events,
                                paymentDue: checked,
                              },
                            },
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Cảnh báo hệ thống</Label>
                      <Switch
                        checked={settings.notifications.events.systemAlert}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              events: {
                                ...settings.notifications.events,
                                systemAlert: checked,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("notifications")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tích hợp</CardTitle>
              <CardDescription>Cấu hình các dịch vụ tích hợp</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={settings.integrations.apiKey}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, apiKey: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    value={settings.integrations.webhookUrl}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, webhookUrl: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label>Dịch vụ tích hợp</Label>
                {settings.integrations.services.map((service, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Tên dịch vụ</Label>
                      <Input
                        value={service.name}
                        onChange={(e) => {
                          const newServices = [...settings.integrations.services]
                          newServices[index] = { ...service, name: e.target.value }
                          setSettings({
                            ...settings,
                            integrations: { ...settings.integrations, services: newServices },
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>API Key</Label>
                      <Input
                        value={service.apiKey}
                        onChange={(e) => {
                          const newServices = [...settings.integrations.services]
                          newServices[index] = { ...service, apiKey: e.target.value }
                          setSettings({
                            ...settings,
                            integrations: { ...settings.integrations, services: newServices },
                          })
                        }}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label>Bật</Label>
                      <Switch
                        checked={service.enabled}
                        onCheckedChange={(checked) => {
                          const newServices = [...settings.integrations.services]
                          newServices[index] = { ...service, enabled: checked }
                          setSettings({
                            ...settings,
                            integrations: { ...settings.integrations, services: newServices },
                          })
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSettings({
                      ...settings,
                      integrations: {
                        ...settings.integrations,
                        services: [
                          ...settings.integrations.services,
                          { name: "", apiKey: "", enabled: false },
                        ],
                      },
                    })
                  }}
                >
                  Thêm dịch vụ
                </Button>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("integrations")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt sao lưu</CardTitle>
              <CardDescription>Cấu hình sao lưu tự động và khôi phục</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="autoBackup">Sao lưu tự động</Label>
                  <Switch
                    id="autoBackup"
                    checked={settings.backup.autoBackup}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        backup: { ...settings.backup, autoBackup: checked },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupSchedule">Lịch sao lưu</Label>
                  <Select
                    value={settings.backup.backupSchedule}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupSchedule: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Hàng ngày</SelectItem>
                      <SelectItem value="weekly">Hàng tuần</SelectItem>
                      <SelectItem value="monthly">Hàng tháng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backupLocation">Vị trí lưu trữ</Label>
                  <Select
                    value={settings.backup.backupLocation}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        backup: { ...settings.backup, backupLocation: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn vị trí" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="cloud">Cloud</SelectItem>
                      <SelectItem value="external">External Drive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionDays">Thời gian lưu trữ (ngày)</Label>
                  <Input
                    id="retentionDays"
                    type="number"
                    value={settings.backup.retentionDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        backup: { ...settings.backup, retentionDays: parseInt(e.target.value) },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("backup")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt hiển thị</CardTitle>
              <CardDescription>Cấu hình ngôn ngữ và định dạng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ</Label>
                  <Select
                    value={settings.display.language}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        display: { ...settings.display, language: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vi">Tiếng Việt</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Múi giờ</Label>
                  <Select
                    value={settings.display.timezone}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        display: { ...settings.display, timezone: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn múi giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Định dạng ngày</Label>
                  <Select
                    value={settings.display.dateFormat}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        display: { ...settings.display, dateFormat: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn định dạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                      <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currencyFormat">Định dạng tiền tệ</Label>
                  <Select
                    value={settings.display.currencyFormat}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        display: { ...settings.display, currencyFormat: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn định dạng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("display")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt in ấn</CardTitle>
              <CardDescription>Cấu hình mẫu in và thông tin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceTemplate">Mẫu hóa đơn</Label>
                  <Select
                    value={settings.printing.invoiceTemplate}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        printing: { ...settings.printing, invoiceTemplate: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mẫu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Mặc định</SelectItem>
                      <SelectItem value="simple">Đơn giản</SelectItem>
                      <SelectItem value="detailed">Chi tiết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptTemplate">Mẫu phiếu</Label>
                  <Select
                    value={settings.printing.receiptTemplate}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        printing: { ...settings.printing, receiptTemplate: value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mẫu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Mặc định</SelectItem>
                      <SelectItem value="simple">Đơn giản</SelectItem>
                      <SelectItem value="detailed">Chi tiết</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="header">Header</Label>
                  <Textarea
                    id="header"
                    value={settings.printing.header}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        printing: { ...settings.printing, header: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="footer">Footer</Label>
                  <Textarea
                    id="footer"
                    value={settings.printing.footer}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        printing: { ...settings.printing, footer: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("printing")} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 