import { useLocation, Link } from "react-router-dom";
import { BookOpen, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div dir="rtl" className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-8xl font-black text-primary/30 tracking-wider">404</h1>
          <div className="h-1 w-16 bg-primary/40 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            الصفحة غير موجودة
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            عذرًا، المسار <span className="font-semibold text-foreground/80 font-mono text-xs px-2 py-0.5 rounded bg-muted">/{pageName}</span> غير متوفر أو تم نقله.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-center gap-3">
          <Link to="/">
            <Button className="rounded-xl font-bold gap-2">
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Button>
          </Link>
          <Link to="/books">
            <Button variant="outline" className="rounded-xl gap-2">
              <BookOpen className="w-4 h-4" />
              تصفح المكتبة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}