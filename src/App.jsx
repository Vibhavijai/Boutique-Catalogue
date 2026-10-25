import { useEffect, useRef, useState } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  Menu,
  X,
  Search,
  LockKeyhole,
  LogOut,
  ImagePlus,
  Pencil,
  Trash2,
  PackagePlus,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { db, ready, shop, price, waLink, image } from "./lib/store.js";

function productImages(product) {
  const urls = Array.isArray(product.image_urls) ? product.image_urls : [];
  const paths = Array.isArray(product.image_paths) ? product.image_paths : [];

  if (urls.length) {
    return urls.map((url, index) => ({ url, path: paths[index] || null }));
  }

  return product.image_url
    ? [{ url: product.image_url, path: product.image_path || null }]
    : [];
}

function productSizeChart(product) {
  if (Array.isArray(product.size_chart) && product.size_chart.length) {
    return product.size_chart.map(({ size, cm }) => ({
      size: String(size || ""),
      cm: cm == null ? "" : String(cm),
    }));
  }

  return (product.sizes || "")
    .split(/[,|]/)
    .map((size) => size.trim())
    .filter(Boolean)
    .map((size) => ({ size, cm: "" }));
}

function SizeChip({ size, cm }) {
  const [flipped, setFlipped] = useState(false);
  const measurement = cm ? `${cm} cm` : "Add cm";

  return (
    <button
      className={`size-chip${flipped ? " flipped" : ""}`}
      type="button"
      onClick={() => setFlipped((current) => !current)}
      aria-label={`${size}, ${cm ? `${cm} cm` : "measurement not set"}. Tap to flip.`}
      aria-pressed={flipped}
      title="Tap to see measurement"
    >
      <span className="size-chip-inner">
        <span className="size-chip-face">{size}</span>
        <span className="size-chip-face size-chip-back">{measurement}</span>
      </span>
    </button>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("maison-theme") || "light",
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("maison-theme", theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () =>
      setTheme((current) => (current === "light" ? "dark" : "light")),
  };
}

function Header() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <Link className="brand" to="/">
        <b className="brand-wordmark">{shop.name}</b>
      </Link>
      <nav className={open ? "nav open" : "nav"}>
        <NavLink to="/collection/men" onClick={() => setOpen(false)}>
          Men
        </NavLink>
        <NavLink to="/collection/women" onClick={() => setOpen(false)}>
          Women
        </NavLink>
      </nav>
      <div className="head-actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          aria-pressed={theme === "dark"}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          <span className="theme-label">
            {theme === "light" ? "Dark" : "Light"}
          </span>
        </button>
        <button
          className="menu"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="simple-footer">
      <span>{shop.name}</span>
      <Link to="/admin/login">Admin</Link>
    </footer>
  );
}

function ProductCard({ product }) {
  const images = productImages(product);
  const [activeImage, setActiveImage] = useState(0);
  const imageTrack = useRef(null);

  function showImage(index) {
    const next = Math.max(0, Math.min(index, images.length - 1));
    setActiveImage(next);
    imageTrack.current?.scrollTo({
      left: next * imageTrack.current.clientWidth,
      behavior: "smooth",
    });
  }

  function updateActiveImage() {
    if (!imageTrack.current) return;
    setActiveImage(
      Math.round(imageTrack.current.scrollLeft / imageTrack.current.clientWidth),
    );
  }

  return (
    <article className="product">
      <div className="prod-img">
        <div
          className="product-image-track"
          ref={imageTrack}
          onScroll={updateActiveImage}
          aria-label={`${product.title} photos`}
        >
          {images.map((item, index) => (
            <img
              key={item.path || item.url}
              src={image(item.url)}
              alt={`${product.title}, photo ${index + 1} of ${images.length}`}
              loading={index ? "lazy" : "eager"}
            />
          ))}
        </div>
        {images.length > 1 && (
          <>
            <button
              className="image-arrow previous"
              type="button"
              onClick={() => showImage(activeImage - 1)}
              aria-label="Previous product photo"
              disabled={activeImage === 0}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="image-arrow next"
              type="button"
              onClick={() => showImage(activeImage + 1)}
              aria-label="Next product photo"
              disabled={activeImage === images.length - 1}
            >
              <ChevronRight size={18} />
            </button>
            <div
              className="image-dots"
              aria-label={`Photo ${activeImage + 1} of ${images.length}`}
            >
              {images.map((item, index) => (
                <button
                  key={item.path || item.url}
                  type="button"
                  className={index === activeImage ? "active" : ""}
                  onClick={() => showImage(index)}
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={index === activeImage ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="prod-copy">
        <h2>{product.title}</h2>
        <b>{price(product.price)}</b>
        {product.sizes && (
          <div
            className="product-sizes"
            role="group"
            aria-label={`Available sizes: ${product.sizes}`}
          >
            <span>Sizes</span>
            <div>
              {productSizeChart(product).map(({ size, cm }) => (
                <SizeChip size={size} cm={cm} key={size} />
              ))}
            </div>
          </div>
        )}
        {product.colors && <p>Colour: {product.colors}</p>}
        <a
          className="product-enquiry"
          href={waLink(
            `Hello ${shop.name}, I am interested in ${product.title}.`,
          )}
          target="_blank"
          rel="noreferrer"
        >
          Enquire on WhatsApp
          <ArrowUpRight size={18} />
        </a>
      </div>
    </article>
  );
}

const categories = {
  Men: ["Shirts", "T-Shirts", "Pants"],
  Women: ["Sarees", "Kurtis", "Western Wear"],
};

function Home() {
  return (
    <>
      <Header />
      <section className="brand-banner" aria-labelledby="brand-banner-title">
        <div className="brand-banner-inner">
          <span className="brand-banner-sun" aria-hidden="true">
            <Sun size={42} strokeWidth={1} />
          </span>
          <p className="brand-banner-eyebrow">A BOUTIQUE FOR EVERY MOMENT</p>
          <h1 id="brand-banner-title">{shop.name}</h1>
          <p className="brand-banner-copy">
            Thoughtfully chosen styles, made to feel like you.
            <br />
            Everyday elegance with a little extra sunshine.
          </p>
          <span className="brand-banner-rule" aria-hidden="true" />
        </div>
      </section>
      <main className="category-home">
        <div className="browse-intro">
          <p className="brand-banner-eyebrow">THE ZEYA EDIT</p>
          <h2>Find your next favourite.</h2>
          <p>Thoughtful pieces for the moments that make up your day.</p>
        </div>
        {Object.entries(categories).map(([gender, items]) => (
          <section className="category-group" key={gender}>
            <div className="category-group-heading">
              <h1>{gender}</h1>
              <span>Curated for you</span>
            </div>
            <div className="category-links">
              {items.map((category) => (
                <Link
                  key={category}
                  to={`/collection/${gender.toLowerCase()}?category=${encodeURIComponent(category)}`}
                >
                  {category}
                  <ArrowUpRight size={18} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}

function Collection() {
  const { gender = "women" } = useParams();
  const currentGender = gender.toLowerCase() === "men" ? "Men" : "Women";
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(ready);
  const [category, setCategory] = useState(
    searchParams.get("category") || "All",
  );

  useEffect(() => {
    setCategory(searchParams.get("category") || "All");
  }, [searchParams]);

  useEffect(() => {
    setProducts([]);
    if (!ready) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    db.from("products")
      .select("*")
      .eq("gender", currentGender)
      .eq("available", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error) setProducts(data || []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [currentGender]);

  const visibleProducts = products.filter(
    (product) =>
      (category === "All" ||
        product.category.toLowerCase() === category.toLowerCase()) &&
      (product.gender === currentGender || product.gender === "Unisex"),
  );

  function chooseCategory(nextCategory) {
    setCategory(nextCategory);
    setSearchParams(nextCategory === "All" ? {} : { category: nextCategory });
  }

  return (
    <>
      <Header />
      <main className="collection-page">
        <div className="collection-heading">
          <Link to="/">Collections</Link>
          <h1>{currentGender}</h1>
        </div>
        <nav
          className="category-tabs"
          aria-label={`${currentGender} categories`}
        >
          <button
            className={category === "All" ? "active" : ""}
            onClick={() => chooseCategory("All")}
          >
            All
          </button>
          {categories[currentGender].map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => chooseCategory(item)}
            >
              {item}
            </button>
          ))}
        </nav>
        <section className="section collection-results">
          {loading ? (
            <p className="not-updated">Loading collection...</p>
          ) : visibleProducts.length ? (
            <div className="grid four">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="not-updated">Not yet updated</p>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
function Login() {
  const [email, E] = useState(""),
    [password, P] = useState(""),
    [error, Err] = useState(""),
    [busy, B] = useState(false),
    nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    if (ready)
      db.auth.getSession().then(({ data }) => {
        if (data.session) nav("/admin");
      });
  }, [nav]);
  async function submit(e) {
    e.preventDefault();
    Err("");
    B(true);
    if (!ready) {
      Err("Supabase is not configured. Follow README.md first.");
      B(false);
      return;
    }
    const { error } = await db.auth.signInWithPassword({ email, password });
    B(false);
    if (error) Err(error.message);
    else nav("/admin");
  }
  return (
    <main className="login-page">
      <div className="login-card">
        <button
          className="theme-toggle login-theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <Link className="back" to="/">
          ← BACK TO STOREFRONT
        </Link>
        <div className="lock">
          <LockKeyhole />
        </div>
        <p className="eyebrow">A PRIVATE SPACE</p>
        <h1>
          Welcome
          <br />
          <em>back.</em>
        </h1>
        <p className="muted">
          Sign in to keep your collection looking its best.
        </p>
        <form onSubmit={submit}>
          <label>
            Email address
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => E(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => P(e.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn" disabled={busy}>
            {busy ? "SIGNING IN…" : "SIGN IN TO YOUR STORE ↗"}
          </button>
        </form>
        <small>
          Admin access is managed through Supabase Authentication and database
          policies.
        </small>
      </div>
    </main>
  );
}
const emptyForm = {
    title: "",
    price: "",
    gender: "Women",
    category: "Sarees",
    product_code: "",
    sizes: "",
    colors: "",
    description: "",
    available: true,
    featured: false,
  },
  catOptions = {
    Men: ["Shirts", "T-Shirts", "Pants"],
    Women: ["Sarees", "Kurtis", "Western Wear"],
  };
function Admin() {
  const [session, SS] = useState(null),
    [products, SP] = useState([]),
    [form, F] = useState(emptyForm),
    [photos, PH] = useState([]),
    [imageDraft, ID] = useState([]),
    [sizeRows, SZ] = useState([{ size: "", cm: "" }]),
    [editing, ED] = useState(null),
    [search, SE] = useState(""),
    [notice, N] = useState(""),
    [error, ER] = useState(""),
    [busy, B] = useState(false),
    nav = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const load = async () => {
    if (!db) return;
    const { data, error } = await db
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) ER(error.message);
    else SP(data || []);
  };
  useEffect(() => {
    if (!ready) {
      ER("Supabase is not configured. Follow README.md first.");
      return;
    }
    db.auth.getSession().then(({ data }) => {
      if (!data.session) nav("/admin/login");
      else {
        SS(data.session);
        load();
      }
    });
    const { data: l } = db.auth.onAuthStateChange((_e, s) => {
      if (!s) nav("/admin/login");
      else SS(s);
    });
    return () => l.subscription.unsubscribe();
  }, [nav]);
  function set(k, v) {
    F((old) => ({ ...old, [k]: v }));
  }
  function edit(p) {
    ED(p.id);
    F({
      title: p.title,
      price: String(p.price),
      gender: p.gender,
      category: p.category,
      product_code: p.product_code || "",
      colors: p.colors || "",
      description: p.description || "",
      available: p.available,
      featured: p.featured,
    });
    PH([]);
    ID(productImages(p));
    SZ(productSizeChart(p));
    N("");
    ER("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function reset() {
    ED(null);
    F(emptyForm);
    PH([]);
    ID([]);
    SZ([{ size: "", cm: "" }]);
    N("");
    ER("");
  }
  async function save(e) {
    e.preventDefault();
    B(true);
    ER("");
    N("");
    if (!ready) {
      ER("Supabase is not configured.");
      B(false);
      return;
    }
    if (!imageDraft.length && !photos.length) {
      ER("Choose a product image.");
      B(false);
      return;
    }
    if (photos.some((photo) => photo.size > 5 * 1024 * 1024)) {
      ER("Each image must be smaller than 5 MB.");
      B(false);
      return;
    }
    if (
      photos.some(
        (photo) =>
          !["image/jpeg", "image/png", "image/webp"].includes(photo.type),
      )
    ) {
      ER("Use JPG, PNG or WebP images.");
      B(false);
      return;
    }
    const old = products.find((p) => p.id === editing);
    const uploadedImages = [];
    for (const photo of photos) {
      const ext =
          photo.name
            .split(".")
            .pop()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "") || "jpg",
        path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await db.storage
        .from("product-images")
        .upload(path, photo, { contentType: photo.type });
      if (error) {
        const cleanup = uploadedImages.map((item) => item.path);
        const cleanupResult = cleanup.length
          ? await db.storage.from("product-images").remove(cleanup)
          : { error: null };
        ER(
          `Image upload failed: ${error.message}${
            cleanupResult.error
              ? ` Uploaded images could not be cleaned up: ${cleanupResult.error.message}`
              : ""
          }`,
        );
        B(false);
        return;
      }
      uploadedImages.push({
        path,
        url: db.storage.from("product-images").getPublicUrl(path).data.publicUrl,
      });
    }
    const savedImages = [...imageDraft, ...uploadedImages];
    const savedSizeChart = sizeRows
      .map(({ size, cm }) => ({ size: size.trim(), cm: cm.trim() }))
      .filter(({ size }) => size);
    const payload = {
      ...form,
      title: form.title.trim(),
      price: Number(form.price),
      product_code: form.product_code.trim() || null,
      sizes: savedSizeChart.map(({ size }) => size).join(", ") || null,
      size_chart: savedSizeChart,
      colors: form.colors.trim() || null,
      description: form.description.trim() || null,
      image_urls: savedImages.map((item) => item.url),
      image_paths: savedImages.map((item) => item.path),
      image_url: savedImages[0].url,
      image_path: savedImages[0].path,
    };
    const result = editing
      ? await db.from("products").update(payload).eq("id", editing)
      : await db.from("products").insert(payload);
    B(false);
    if (result.error) {
      const cleanupResult = uploadedImages.length
        ? await db.storage
            .from("product-images")
            .remove(uploadedImages.map((item) => item.path))
        : { error: null };
      ER(
        `${result.error.message}${
          cleanupResult.error
            ? ` Uploaded images could not be cleaned up: ${cleanupResult.error.message}`
            : ""
        }`,
      );
      return;
    }
    const removedPaths = old
      ? productImages(old)
          .filter((item) => !imageDraft.some((kept) => kept.path === item.path))
          .map((item) => item.path)
          .filter(Boolean)
      : [];
    if (removedPaths.length) {
      const { error: cleanupError } = await db.storage
        .from("product-images")
        .remove(removedPaths);
      if (cleanupError) {
        N(
          `${editing ? "Product updated." : "Product added."} Removed photos could not be cleaned up: ${cleanupError.message}`,
        );
      } else {
        N(editing ? "Product updated." : "Product added to the collection.");
      }
    } else {
      N(editing ? "Product updated." : "Product added to the collection.");
    }
    F(emptyForm);
    ED(null);
    PH([]);
    ID([]);
    SZ([{ size: "", cm: "" }]);
    await load();
  }
  async function remove(p) {
    if (!confirm(`Delete "${p.title}" permanently?`)) return;
    const { error } = await db.from("products").delete().eq("id", p.id);
    if (error) {
      ER(error.message);
      return;
    }
    const imagePaths = productImages(p)
      .map((item) => item.path)
      .filter(Boolean);
    if (imagePaths.length) {
      const { error: cleanupError } = await db.storage
        .from("product-images")
        .remove(imagePaths);
      if (cleanupError) {
        ER(`Product deleted, but its photos could not be removed: ${cleanupError.message}`);
        await load();
        return;
      }
    }
    N("Product deleted.");
    await load();
  }
  async function logout() {
    await db.auth.signOut();
    nav("/admin/login");
  }
  const filtered = products.filter((p) =>
    [p.title, p.category, p.gender, p.product_code]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <main className="admin-page">
      <header className="admin-top">
        <Link className="brand" to="/">
          <i>m.</i>
          <span>
            <b>{shop.name}</b>
            <small>STUDIO ADMIN</small>
          </span>
        </Link>
        <div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <Link to="/" className="store-link">
            VIEW STOREFRONT ↗
          </Link>
          <button onClick={logout} className="logout">
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </header>
      <div className="admin-shell">
        <div className="welcome">
          <div>
            <h1>Collections</h1>
          </div>
          <div className="stat">
            <small>PRODUCTS</small>
            <b>{String(products.length).padStart(2, "0")}</b>
          </div>
        </div>
        {error && <p className="alert error">{error}</p>}
        {notice && <p className="alert success">✓ {notice}</p>}
        <div className="admin-layout">
          <section className="editor">
            <div className="panel-title">
              <PackagePlus />
              <div>
                <small>{editing ? "EDIT PRODUCT" : "NEW PRODUCT"}</small>
                <h2>{editing ? "Edit product" : "Add product"}</h2>
              </div>
            </div>
            <form onSubmit={save}>
              <label className="upload">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(e) => {
                    PH((current) => [...current, ...Array.from(e.target.files || [])]);
                    e.target.value = "";
                  }}
                />
                <ImagePlus />
                <b>Add product photos</b>
                <span>Select multiple JPG, PNG or WebP · up to 5 MB each</span>
                <small>PRODUCT PHOTOS *</small>
              </label>
              {(imageDraft.length > 0 || photos.length > 0) && (
                <div className="photo-list" aria-label="Selected product photos">
                  {imageDraft.map((item, index) => (
                    <div className="photo-item" key={item.path || item.url}>
                      <img src={item.url} alt={`Product photo ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() =>
                          ID((current) => current.filter((_, i) => i !== index))
                        }
                        aria-label={`Remove product photo ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {photos.map((photo, index) => (
                    <div className="photo-file" key={`${photo.name}-${photo.lastModified}-${index}`}>
                      <span>{photo.name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          PH((current) => current.filter((_, i) => i !== index))
                        }
                        aria-label={`Remove ${photo.name}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label>
                PRODUCT NAME *
                <input
                  required
                  maxLength="100"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Heritage silk saree"
                />
              </label>
              <div className="two">
                <label>
                  PRICE (₹) *
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="2499"
                  />
                </label>
                <label>
                  PRODUCT CODE
                  <input
                    value={form.product_code}
                    onChange={(e) => set("product_code", e.target.value)}
                    placeholder="W-204"
                  />
                </label>
              </div>
              <div className="two">
                <label>
                  COLLECTION
                  <select
                    value={form.gender}
                    onChange={(e) => {
                      set("gender", e.target.value);
                      set(
                        "category",
                        catOptions[e.target.value]?.[0] || "Shirts",
                      );
                    }}
                  >
                    <option>Women</option>
                    <option>Men</option>
                    <option>Unisex</option>
                  </select>
                </label>
                <label>
                  CATEGORY
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    {(form.gender === "Unisex"
                      ? [...catOptions.Men, ...catOptions.Women]
                      : catOptions[form.gender]
                    ).map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className="size-guide-editor">
                <legend>SIZE GUIDE <span>Measurements in centimetres</span></legend>
                {sizeRows.map((row, index) => (
                  <div className="size-guide-row" key={index}>
                    <label>
                      SIZE
                      <input
                        value={row.size}
                        onChange={(e) =>
                          SZ((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, size: e.target.value } : item,
                            ),
                          )
                        }
                        placeholder="S"
                      />
                    </label>
                    <label>
                      CM
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={row.cm}
                        onChange={(e) =>
                          SZ((current) =>
                            current.map((item, i) =>
                              i === index ? { ...item, cm: e.target.value } : item,
                            ),
                          )
                        }
                        placeholder="96"
                      />
                    </label>
                    <button
                      type="button"
                      className="remove-size"
                      onClick={() =>
                        SZ((current) =>
                          current.length > 1
                            ? current.filter((_, i) => i !== index)
                            : [{ size: "", cm: "" }],
                        )
                      }
                      aria-label={`Remove size row ${index + 1}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-size"
                  onClick={() => SZ((current) => [...current, { size: "", cm: "" }])}
                >
                  <Plus size={15} /> Add size
                </button>
              </fieldset>
              <label>
                COLOURS
                <input
                  value={form.colors}
                  onChange={(e) => set("colors", e.target.value)}
                  placeholder="Ivory, olive, black"
                />
              </label>
              <label>
                DESCRIPTION
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Product details"
                />
              </label>
              <div className="toggles">
                <label>
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) => set("available", e.target.checked)}
                  />
                  <span>
                    <b>Available to customers</b>
                    <small>Hide from the website.</small>
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => set("featured", e.target.checked)}
                  />
                  <span>
                    <b>Featured product</b>
                    <small>Reserved for future homepage use.</small>
                  </span>
                </label>
              </div>
              <div className="save-row">
                <button className="btn" disabled={busy}>
                  {busy ? "SAVING…" : editing ? "SAVE CHANGES" : "ADD PRODUCT"}
                </button>
                {editing && (
                  <button type="button" className="cancel" onClick={reset}>
                    CANCEL
                  </button>
                )}
              </div>
            </form>
          </section>
          <section className="inventory">
            <div className="inventory-head">
              <div>
                <small>PRODUCTS</small>
                <h2>Your products</h2>
              </div>
              <small>{filtered.length} ITEMS</small>
            </div>
            <label className="search">
              <Search size={15} />
              <input
                value={search}
                onChange={(e) => SE(e.target.value)}
                placeholder="Search name, code, category…"
              />
            </label>
            <div className="inventory-list">
              {filtered.map((p) => (
                <article key={p.id}>
                  <img
                    src={productImages(p)[0]?.url || p.image_url}
                    alt={p.title}
                  />
                  <div className="item-info">
                    <b>{p.title}</b>
                    <span>
                      {p.gender} / {p.category}
                    </span>
                    <strong>{price(p.price)}</strong>
                    <small className={p.available ? "live" : "hidden-stock"}>
                      {p.available ? "LIVE ON WEBSITE" : "HIDDEN"}
                      {p.featured ? " · FEATURED" : ""}
                    </small>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => edit(p)} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => remove(p)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
              {!filtered.length && (
                <p className="empty-inventory">
                  {products.length
                    ? "No matching products."
                    : "Your collection is ready for its first piece."}
                </p>
              )}
            </div>
          </section>
        </div>
        <p className="admin-note">
          Product changes appear on the website after saving.
        </p>
      </div>
    </main>
  );
}
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/collection/:gender" element={<Collection />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
