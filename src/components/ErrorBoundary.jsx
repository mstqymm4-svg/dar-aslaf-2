import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem("base44_access_token");
    } catch {}
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-foreground">دار العلوم - تنبيه</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              حدث خطأ مؤقت أثناء معالجة الصفحة. يمكنك إعادة التحميل أو العودة للرئيسية.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-muted rounded-xl text-left font-mono text-xs text-muted-foreground overflow-x-auto">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button onClick={this.handleReload} className="gap-2 rounded-xl">
                <RefreshCw className="w-4 h-4" />
                إعادة التحميل
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="gap-2 rounded-xl">
                <Home className="w-4 h-4" />
                الرئيسية
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
