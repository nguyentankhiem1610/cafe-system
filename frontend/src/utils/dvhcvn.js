// dvhcvn helper: fetch + cache the dataset and provide simple lookup helpers
const URL =
  "https://raw.githubusercontent.com/daohoangson/dvhcvn/master/data/dvhcvn.json";
let _cache = null;

async function fetchAndCache() {
  if (_cache) return _cache;
  // try dynamic import of local JSON (frontend/src/data/dvhcvn.json)
  try {
    // Vite supports json imports
    // eslint-disable-next-line no-undef
    const mod = await import("../data/dvhcvn.json");
    const data = mod?.default || mod;
    _cache = Array.isArray(data) ? data : data.provinces || data.data || [];
    // normalize if data uses level1/level2/level3 keys (dvhcvn format)
    if (_cache.length && _cache[0].level2s) {
      _cache = _cache.map((p) => ({
        code: p.level1_id || p.code || p.id,
        name: p.name || p.title,
        districts: (p.level2s || []).map((d) => ({
          code: d.level2_id || d.code || d.id,
          name: d.name,
          wards: (d.level3s || []).map((w) => ({
            code: w.level3_id || w.code || w.id,
            name: w.name,
          })),
        })),
      }));
    }
    return _cache;
  } catch (e) {
    // fall back to localStorage or network
  }

  // try localStorage next
  try {
    if (typeof window !== "undefined") {
      const ls = window.localStorage.getItem("dvhcvn_cache_v1");
      if (ls) {
        _cache = JSON.parse(ls);
        return _cache;
      }
    }
  } catch (e) {
    // ignore
  }

  // finally fetch from GitHub raw
  const res = await fetch(URL);
  if (!res.ok) throw new Error("Failed to fetch dvhcvn.json");
  const data = await res.json();
  _cache = Array.isArray(data) ? data : data.provinces || data.data || [];
  if (_cache.length && _cache[0].level2s) {
    _cache = _cache.map((p) => ({
      code: p.level1_id || p.code || p.id,
      name: p.name || p.title,
      districts: (p.level2s || []).map((d) => ({
        code: d.level2_id || d.code || d.id,
        name: d.name,
        wards: (d.level3s || []).map((w) => ({
          code: w.level3_id || w.code || w.id,
          name: w.name,
        })),
      })),
    }));
  }
  try {
    if (typeof window !== "undefined")
      window.localStorage.setItem("dvhcvn_cache_v1", JSON.stringify(_cache));
  } catch (e) {}
  return _cache;
}

export async function getProvinces() {
  return await fetchAndCache();
}

export async function getDistricts(provinceCode) {
  const provinces = await fetchAndCache();
  const p = provinces.find(
    (x) =>
      String(x.code) === String(provinceCode) ||
      String(x.id) === String(provinceCode),
  );
  return p ? p.districts || p.d || [] : [];
}

export async function getWards(districtCode) {
  const provinces = await fetchAndCache();
  for (const p of provinces) {
    const districts = p.districts || p.d || [];
    const d = districts.find(
      (x) =>
        String(x.code) === String(districtCode) ||
        String(x.id) === String(districtCode),
    );
    if (d) return d.wards || d.w || [];
  }
  return [];
}

export async function findName(list, code) {
  if (!code || !list) return null;
  const it = list.find((x) => String(x.code || x.id || x.Ma) === String(code));
  return it ? it.name || it.ten || it.Ten || it.title || null : null;
}

export default { getProvinces, getDistricts, getWards, findName };
