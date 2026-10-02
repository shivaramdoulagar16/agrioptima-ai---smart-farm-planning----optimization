import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; email: string }, token: string) => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
  onLogout
}) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const body = isRegister ? { name, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess(
      { name: 'Ramesh Patel', email: 'farmer@agrioptima.ai' },
      'demo_jwt_token_2026'
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl relative border border-[#e5e8e1]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#757d74] hover:text-[#1a1e1b] p-1 rounded-md"
        >
          <X className="h-5 w-5" />
        </button>

        {currentUser ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 rounded-full bg-[#eef4ed] text-[#1b4324] font-bold text-lg flex items-center justify-center mx-auto border border-[#d6e3d3]">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-[#1a1e1b] text-base">{currentUser.name}</h3>
              <p className="text-xs text-[#6b736c]">{currentUser.email}</p>
            </div>
            <div className="p-3 bg-[#f8f9f6] rounded-lg text-xs text-[#363e37] border border-[#e5e8e1]">
              Authenticated Session • All farm plans and scenarios saved to your profile.
            </div>
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-[#faf5f5] hover:bg-[#faebeb] text-[#b91c1c] border border-[#f5c6c6] transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="font-bold text-[#1a1e1b] text-base">
                {isRegister ? 'Register Farm Account' : 'Farmer Portal Login'}
              </h3>
              <p className="text-xs text-[#6b736c] mt-0.5">
                {isRegister ? 'Create an account to persist farm plans' : 'Access your farm holdings and saved optimization plans'}
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-[#fff8f8] text-[#b91c1c] text-xs border border-[#f5c6c6]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {isRegister && (
                <div>
                  <label className="block font-semibold text-[#3d453e] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="h-4 w-4 absolute left-3 top-2.5 text-[#868e83]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-9 pr-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-2.5 text-[#868e83]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@agrioptima.ai"
                    className="w-full pl-9 pr-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3d453e] mb-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-2.5 text-[#868e83]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-[#dce0d8] rounded-lg focus:ring-1 focus:ring-[#1b4324] focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#1b4324] hover:bg-[#163b20] text-white shadow-2xs transition-colors"
              >
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="text-center text-xs">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-[#1b4324] hover:underline font-medium"
              >
                {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#edf0ea]"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-[#757d74]">Quick Demo Access</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-[#f4f7f3] hover:bg-[#eaf0e8] text-[#1b4324] border border-[#d8e3d5] transition-colors flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Login as Demo Farmer (1-Click)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
