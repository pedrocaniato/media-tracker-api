"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, User as UserIcon, Camera, AtSign, AlignLeft } from "lucide-react";
import Link from "next/link";

export default function EditProfilePage() {
  const router = useRouter();
  const params = useParams();
  const usernameParam = params.username as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    image: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem("userToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const json = await res.json();
          const { name, username, bio, image } = json.data;
          
          // Verificar se o usuário logado é o dono desse perfil
          if (username.toLowerCase() !== usernameParam.toLowerCase()) {
             router.push(`/user/${username}/edit`);
             return;
          }

          setFormData({
            name: name || "",
            username: username || "",
            bio: bio || "",
            image: image || "",
          });
        } else {
          setError("Falha ao carregar perfil.");
        }
      } catch (err) {
        setError("Erro de rede.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [usernameParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("userToken");
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Se mudou o username, redirecionar para a nova URL após um breve delay
        if (formData.username.toLowerCase() !== usernameParam.toLowerCase()) {
           setTimeout(() => {
             router.push(`/user/${formData.username}`);
           }, 1000);
        } else {
           setTimeout(() => {
             router.push(`/user/${formData.username}`);
           }, 1000);
        }
      } else {
        setError(json.message || "Erro ao salvar perfil.");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="text-zinc-500 animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link
            href={`/user/${usernameParam}`}
            className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Editar Perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Preview & URL */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0 border-2 border-zinc-700">
               {formData.image ? (
                 <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-zinc-600">
                   <UserIcon size={40} />
                 </div>
               )}
            </div>
            <div className="flex-1 w-full">
               <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2 block">URL da Foto</label>
               <div className="relative">
                 <Camera size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                 <input
                   type="text"
                   value={formData.image}
                   onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                   placeholder="https://exemplo.com/foto.jpg"
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-white/20 transition-all text-sm"
                 />
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nome */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <UserIcon size={12} /> Nome de Exibição
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 outline-none focus:border-zinc-500 transition-all"
                placeholder="Seu nome"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <AtSign size={12} /> Username único
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 outline-none focus:border-zinc-500 transition-all"
                placeholder="usuario"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <AlignLeft size={12} /> Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 outline-none focus:border-zinc-500 transition-all min-h-[120px] resize-none"
              placeholder="Conte um pouco sobre você..."
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
              Perfil salvo com sucesso! Redirecionando...
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
}
