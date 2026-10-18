import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BookOpen, LogIn, UserPlus, Lock, Mail, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import AuthLayout from "@/components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      toast.error("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail.trim(), loginPassword);
      toast.success("تم تسجيل الدخول بنجاح");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      toast.error("فشل تسجيل الدخول: " + (err.message || "تأكد من صحة البيانات"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regEmail.trim() || !regPassword) {
      toast.error("يرجى ملء كافة الحقول المطلوبة");
      return;
    }
    setLoading(true);
    try {
      await register(regEmail.trim(), regPassword, regName.trim());
      toast.success("تم إنشاء الحساب بنجاح");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Register error:", err);
      toast.error("فشل إنشاء الحساب: " + (err.message || "يرجى المحاولة مرة أخرى"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl">
      <AuthLayout
        icon={BookOpen}
        title="دار العلوم"
        subtitle="المكتبة الإسلامية الرقمية الشاملة"
        footer={
          <div className="flex flex-col items-center gap-2">
            <Link to="/" className="text-primary hover:underline text-sm font-medium">
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        }
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="gap-2">
              <LogIn className="w-4 h-4" /> تسجيل الدخول
            </TabsTrigger>
            <TabsTrigger value="register" className="gap-2">
              <UserPlus className="w-4 h-4" /> إنشاء حساب
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Login */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="pr-10 text-left"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm font-medium">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="pr-10 text-left"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                <LogIn className="w-4 h-4" />
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </TabsContent>

          {/* Tab 2: Register */}
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reg-name" className="text-sm font-medium">الاسم الكامل</Label>
                <div className="relative">
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="الاسم الكريم"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="pr-10"
                  />
                  <User className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-sm font-medium">البريد الإلكتروني</Label>
                <div className="relative">
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    className="pr-10 text-left"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-sm font-medium">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="•••••••• (6 أحرف على الأقل)"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10 text-left"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-muted-foreground absolute right-3 top-3" />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2 mt-2">
                <UserPlus className="w-4 h-4" />
                {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </AuthLayout>
    </div>
  );
}
