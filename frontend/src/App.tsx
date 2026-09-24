import { useMemo, useState } from 'react'
import {
  Braces,
  Check,
  CircleCheck,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Code2,
  Command,
  Database,
  ExternalLink,
  FileJson,
  Layers3,
  LogIn,
  MapPinned,
  Play,
  RefreshCw,
  RotateCcw,
  Sparkles,
  SquareActivity,
  Table2,
  WandSparkles,
  X,
} from 'lucide-react'

import './App.css'

const starterJson = `{
  "policyNumber": "POL-2026-001",
  "idEnvio": 1042,
  "frecuencia": "Mensual",
  "tipoEndoso": "CambioFrecuencia",
  "producto": "ProductosVida",
  "plan": "Plan Protección Total",
  "moneda": "PEN",
  "usuario": "maria.garcia",
  "fechaSolicitud": "2026-09-24",
  "fechaCliente": "2026-09-24",
  "fechaEfectiva": "2026-09-25"
}`

const defaultEndpoint = `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000'}/api/v1/endorse/translate`
const defaultRouteEndpoint = `${import.meta.env.VITE_ROUTE_API_URL ?? 'http://localhost:8080'}/api/v1/routes/nearest-depot`
const routeStarterJson = `{
  "accidentLocation": "San Isidro",
  "depots": ["Miraflores", "Ate"],
  "graph": {
    "Miraflores": { "San Isidro": 7, "Barranco": 3 },
    "San Isidro": { "Miraflores": 7, "Lince": 4 },
    "Barranco": { "Miraflores": 3, "Surco": 5 },
    "Lince": { "San Isidro": 4, "Surco": 6 },
    "Surco": { "Barranco": 5, "Lince": 6, "Ate": 10 },
    "Ate": { "Surco": 10 }
  }
}`
type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

function isRecord(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function countKeys(value: JsonValue): number {
  if (Array.isArray(value)) return value.reduce<number>((total, item) => total + countKeys(item), 0)
  if (isRecord(value)) return Object.values(value).reduce<number>((total, item) => total + 1 + countKeys(item), 0)
  return 0
}

function JsonNode({ name, value, depth = 0 }: { name?: string; value: JsonValue; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const isObject = isRecord(value)
  const isArray = Array.isArray(value)
  const expandable = isObject || isArray

  if (!expandable) {
    return <div className="json-row" style={{ paddingLeft: `${depth * 18 + 14}px` }}>
      {name && <span className="json-key">{name}</span>}
      {name && <span className="json-colon">:</span>}
      <span className={`json-value json-${value === null ? 'null' : typeof value}`}>
        {value === null ? 'null' : typeof value === 'string' ? `"${value}"` : String(value)}
      </span>
    </div>
  }

  const entries = isArray ? value.map((item, index) => [String(index), item] as const) : Object.entries(value)
  return <div>
    <button className="json-row json-toggle" style={{ paddingLeft: `${depth * 18 + 8}px` }} onClick={() => setOpen(!open)}>
      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      {name && <span className="json-key">{name}</span>}
      {name && <span className="json-colon">:</span>}
      <span className="json-bracket">{isArray ? '[' : '{'}</span>
      <span className="json-count">{isArray ? `[${entries.length}]` : `{${entries.length}}`}</span>
    </button>
    {open && entries.map(([key, item]) => <JsonNode key={key} name={isArray ? undefined : key} value={item} depth={depth + 1} />)}
    {open && <div className="json-row json-closing" style={{ paddingLeft: `${depth * 18 + 22}px` }}>{isArray ? ']' : '}'}</div>}
  </div>
}

type ApiInfo = { status: string; service: string; version: string; database: string; timestamp: string }
type ApiSpec = { paths?: Record<string, { get?: { summary?: string }; post?: { summary?: string } }> }
type CatalogEntry = {
  product: string
  productName: string
  template: { tipoEndoso: string; tipoEndosoPol: string; codigoEndoso: string }
  fields: Array<{ key: string; label: string; source: string; defaultValue: string | null; required: boolean; order: number }>
  events: Array<{ description: string; orderEvent: number }>
}
type WorkbenchMode = 'transform' | 'route' | 'architecture'

function ArchitectureView() {
  return <section className="architecture-view">
    <div className="architecture-heading"><div><div className="eyebrow"><Layers3 size={13} /> ARQUITECTURA TO-BE</div><h2>Reto 3</h2><p>Diseño resiliente para evitar desembolsos duplicados cuando INARI demora o responde 502.</p></div></div>
    <div className="architecture-flow">
      <div className="architecture-node node-client"><strong>Cliente</strong><span>Solicita desembolso</span></div><div className="architecture-arrow">Idempotency-Key</div>
      <div className="architecture-node node-api"><strong>Backend Node.js</strong><span>Cloud Run<br />responde 202 Accepted</span></div><div className="architecture-arrow">lock + estado</div>
      <div className="architecture-node node-control"><strong>Firestore / Redis</strong><span>Distributed Lock<br />PENDING / PROCESSING</span></div><div className="architecture-arrow">publica tarea</div>
      <div className="architecture-node node-queue"><strong>Cloud Tasks / Pub/Sub</strong><span>reintentos<br />exponential backoff</span></div><div className="architecture-arrow">consume</div>
      <div className="architecture-node node-worker"><strong>Worker Cloud Run</strong><span>revalida idempotencia<br />llama a INARI</span></div><div className="architecture-arrow">requestId</div>
      <div className="architecture-node node-legacy"><strong>VMWARE INARI</strong><span>admwr-api<br />sistema legado</span></div>
    </div>
    <div className="architecture-bottom"><div className="architecture-card"><div className="status-card-label">resiliencia</div><strong>502 / timeout</strong><span>La cola reintenta sin bloquear al cliente. Los fallos definitivos terminan en DLQ.</span></div><div className="architecture-card"><div className="status-card-label">estado</div><strong>Firestore</strong><span>Persiste el resultado y permite consultar la operación aunque el cliente se desconecte.</span></div><div className="architecture-card"><div className="status-card-label">notificación</div><strong>SSE / WebSocket / Polling</strong><span>El frontend recibe PENDING, PROCESSING, SUCCEEDED o FAILED.</span></div></div>
  </section>
}

function ApiInspector({ info, spec, loading, specUrl, onRefresh }: { info: ApiInfo | null; spec: ApiSpec | null; loading: boolean; specUrl: string; onRefresh: () => void }) {
  const routes = spec ? Object.entries(spec.paths ?? {}) : []
  return <section className="inspector-view">
    <div className="inspector-heading"><div><div className="eyebrow"><SquareActivity size={13} /> API OBSERVER</div><h2>Estado del servicio.</h2><p>Una lectura rápida de salud, contrato y rutas disponibles.</p></div><button className="refresh-button" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin-icon' : ''} /> actualizar</button></div>
    <div className="status-grid">
      <div className="status-card status-primary"><div className="status-card-label">healthcheck</div><div className="health-value"><span className="health-pulse" />{info?.status === 'ok' ? 'operativo' : info ? 'degradado' : 'sin datos'}</div><span>{info?.service ?? 'Conecta el API para consultar'}</span></div>
      <div className="status-card"><div className="status-card-label">base de datos</div><div className="metric-value"><CircleCheck size={19} /> {info?.database ?? '—'}</div><span>conexión TypeORM</span></div>
      <div className="status-card"><div className="status-card-label">contrato</div><div className="metric-value">OpenAPI <span className="version-pill">{info?.version ?? 'v1'}</span></div><span>{routes.length || '—'} rutas documentadas</span></div>
    </div>
    <div className="inspector-columns"><div className="inspector-block"><div className="block-title"><Layers3 size={15} /> Rutas disponibles <span>{routes.length}</span></div>{routes.map(([path, methods]) => <div className="route-row" key={path}><code>{path}</code><span>{methods.post ? 'POST' : 'GET'}</span><small>{methods.post?.summary ?? methods.get?.summary}</small></div>)}</div><div className="inspector-block contract-block"><div className="block-title"><Code2 size={15} /> documento <a href={specUrl} target="_blank" rel="noreferrer"><ExternalLink size={13} /></a></div><pre>{JSON.stringify(spec ?? { message: 'Pulsa actualizar para cargar OpenAPI' }, null, 2)}</pre></div></div>
    {info && <div className="last-sync">Última lectura <strong>{new Date(info.timestamp).toLocaleTimeString()}</strong></div>}
  </section>
}

function DatabaseInspector({ catalog, loading, onRefresh }: { catalog: CatalogEntry[]; loading: boolean; onRefresh: () => void }) {
  return <section className="inspector-view">
    <div className="inspector-heading"><div><div className="eyebrow"><Database size={13} /> DATA CATALOG</div><h2>Lo que vive en la BD.</h2><p>Plantillas cargadas desde producto, campos ordenados y eventos del core.</p></div><button className="refresh-button" onClick={onRefresh} disabled={loading}><RefreshCw size={15} className={loading ? 'spin-icon' : ''} /> actualizar</button></div>
    <div className="database-summary"><div><strong>{catalog.length}</strong><span>plantillas</span></div><div><strong>{catalog.reduce((total, item) => total + item.fields.length, 0)}</strong><span>campos configurados</span></div><div><strong>{catalog.reduce((total, item) => total + item.events.length, 0)}</strong><span>eventos ordenados</span></div></div>
    <div className="catalog-list">{catalog.length === 0 ? <div className="empty-catalog"><Table2 size={24} /><strong>No hay datos cargados</strong><span>Conecta el API y actualiza el catálogo.</span></div> : catalog.map((item) => <article className="catalog-card" key={`${item.product}-${item.template.tipoEndoso}`}><div className="catalog-card-head"><div><span className="catalog-product">{item.productName}</span><h3>{item.template.tipoEndoso}</h3></div><span className="template-code">{item.template.codigoEndoso}</span></div><div className="catalog-meta"><span><b>{item.fields.length}</b> campos</span><span><b>{item.events.length}</b> eventos</span><span>{item.template.tipoEndosoPol}</span></div><div className="field-table"><div className="field-row field-head"><span>orden</span><span>etiqueta / origen</span><span>default</span></div>{item.fields.map((field) => <div className="field-row" key={field.key}><span className="order-chip">{String(field.order).padStart(2, '0')}</span><span><strong>{field.label}</strong><small>{field.source}</small></span><span className={field.defaultValue ? 'default-value' : 'empty-default'}>{field.defaultValue ?? '—'}</span></div>)}</div><div className="event-strip"><span><Table2 size={13} /> eventAppliedEntities</span>{item.events.map((event) => <span className="event-pill" key={event.description}>{event.orderEvent}. {event.description}</span>)}</div></article>)}</div>
  </section>
}

function App() {
  const [view, setView] = useState<'workbench' | 'api' | 'database' | 'architecture'>('workbench')
  const [input, setInput] = useState(starterJson)
  const endpoint = defaultEndpoint
  const routeEndpoint = defaultRouteEndpoint
  const [mode, setMode] = useState<WorkbenchMode>('transform')
  const [token, setToken] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [result, setResult] = useState<JsonValue | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null)
  const [apiSpec, setApiSpec] = useState<ApiSpec | null>(null)
  const [catalog, setCatalog] = useState<CatalogEntry[]>([])
  const [inspectorLoading, setInspectorLoading] = useState(false)

  const serviceBase = endpoint.replace(/\/api\/v1\/endorse\/translate$|\/endorse\/translate$/, '')
  const routeBase = routeEndpoint.replace(/\/api\/v1\/routes\/nearest-depot$/, '')
  const apiBase = mode === 'route' ? routeBase : serviceBase

  function currentAuthEndpoint() {
    return apiBase + '/api/v1/auth/dev-token'
  }

  const parsedInput = useMemo(() => {
    try { return { value: JSON.parse(input) as JsonValue, error: '' } }
    catch (parseError) { return { value: null, error: parseError instanceof Error ? parseError.message : 'JSON no válido' } }
  }, [input])

  async function loadApiStatus() {
    setInspectorLoading(true); setError('')
    try {
      const [healthResponse, specResponse] = await Promise.all([fetch(`${apiBase}/health`), fetch(`${apiBase}/openapi.json`)]);
      if (!healthResponse.ok || !specResponse.ok) throw new Error('El API no está disponible.')
      setApiInfo(await healthResponse.json() as ApiInfo); setApiSpec(await specResponse.json() as ApiSpec)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar el estado del API.') }
    finally { setInspectorLoading(false) }
  }

  async function login(): Promise<string | null> {
    setLoginLoading(true); setError('')
    try {
      const response = await fetch(currentAuthEndpoint(), {
        method: 'POST',
        headers: mode === 'route' ? { 'X-Dev-Auth': 'true' } : undefined,
      })
      const body = await response.json() as JsonValue
      if (!response.ok || !isRecord(body) || typeof body.token !== 'string') {
        throw new Error(isRecord(body) && typeof body.error === 'string' ? body.error : 'No se pudo generar el token de desarrollo.')
      }
      setToken(body.token)
      return body.token
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión automáticamente.') }
    finally { setLoginLoading(false) }
    return null
  }

  async function loadCatalog() {
    const authToken = token.trim() || await login()
    if (!authToken) return
    setInspectorLoading(true); setError('')
    try {
      const response = await fetch(`${serviceBase}/api/v1/database/templates`, { headers: { Authorization: `Bearer ${authToken}` } })
      const body = await response.json() as JsonValue
      if (!response.ok) throw new Error(isRecord(body) && typeof body.error === 'string' ? body.error : `El API respondió ${response.status}`)
      setCatalog(body as unknown as CatalogEntry[])
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo consultar la base de datos.') }
    finally { setInspectorLoading(false) }
  }

  async function transformJson() {
    setError(''); setResult(null)
    if (parsedInput.error) { setError(`JSON de entrada inválido: ${parsedInput.error}`); return }
    const authToken = token.trim() || await login()
    if (!authToken) return
    setIsLoading(true)
    try {
      const response = await fetch(mode === 'route' ? routeEndpoint : endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body: JSON.stringify(parsedInput.value),
      })
      const body = await response.json() as JsonValue
      if (!response.ok) throw new Error(isRecord(body) && typeof body.error === 'string' ? body.error : `El API respondió ${response.status}`)
      setResult(body)
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No se pudo conectar con el API.') }
    finally { setIsLoading(false) }
  }

  function selectMode(nextMode: WorkbenchMode) {
    setMode(nextMode)
    setView(nextMode === 'architecture' ? 'architecture' : 'workbench')
    setInput(nextMode === 'route' ? routeStarterJson : starterJson)
    setResult(null)
    setError('')
  }

  function formatInput() {
    if (parsedInput.error) { setError(`No se puede formatear: ${parsedInput.error}`); return }
    setInput(JSON.stringify(parsedInput.value, null, 2)); setError('')
  }

  function clearAll() { setInput(''); setResult(null); setError('') }

  async function copyResult() {
    if (!result) return
    await navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    setCopied(true); window.setTimeout(() => setCopied(false), 1600)
  }

  if (!token) {
    return <main className="app-shell login-shell"><div className="ambient ambient-one" /><div className="ambient ambient-two" /><section className="login-gate"><div className="brand-mark"><Braces size={21} strokeWidth={2.4} /></div><h1>Reto tecnico<br />Interseguro<br /><em>Victor Larco</em></h1><button className="login-button" onClick={() => void login()} disabled={loginLoading}><LogIn size={17} /> {loginLoading ? 'generando sesión' : 'iniciar sesión'}</button>{error && <div className="error-banner"><X size={16} /><span>{error}</span></div>}</section></main>
  }

  return <main className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <nav className="topbar">
      <div className="brand-lockup select-none"><div className="brand-mark"><Braces size={17} strokeWidth={2.4} /></div><div><div className="brand-name">VICTOR LARCO <span>RETO TECNICO</span></div><div className="brand-caption">multi-api workbench</div></div></div>
      <div className="topbar-meta"><button className={`nav-tab ${mode === 'transform' ? 'active' : ''}`} onClick={() => selectMode('transform')}><Braces size={14} /> reto 1</button><button className={`nav-tab ${mode === 'route' ? 'active' : ''}`} onClick={() => selectMode('route')}><MapPinned size={14} /> reto 2</button><button className={`nav-tab ${mode === 'architecture' ? 'active' : ''}`} onClick={() => selectMode('architecture')}><Layers3 size={14} /> reto 3</button><button className="nav-tab" onClick={() => void login()} disabled={loginLoading}><LogIn size={14} /> {loginLoading ? 'generando' : 'renovar token'}</button><span className="version-pill">v1</span></div>
    </nav>

    <section className="intro-row"><div><div className="eyebrow"><Sparkles size={13} /> {mode === 'architecture' ? 'ARCHITECTURE VIEW' : 'API VERSION 1'}</div><h1>Reto {mode === 'route' ? '2' : mode === 'architecture' ? '3' : '1'}</h1><p className="intro-copy">{mode === 'route' ? 'Encuentra el depósito más cercano a un accidente calculando el camino mínimo sobre un grafo real de distritos y distancias.' : mode === 'architecture' ? 'Visualiza la arquitectura resiliente diseñada para evitar desembolsos duplicados cuando INARI demora o responde 502.' : 'Transforma un JSON estructurado de endoso en la respuesta que consume el core usando plantillas configurables.'}</p></div><div className="intro-aside"><span className="aside-number">{mode === 'route' ? '02' : mode === 'architecture' ? '03' : '01'}</span><span>{mode === 'route' ? <>camino mínimo<br />en tiempo real</> : mode === 'architecture' ? <>flujo resiliente<br />en GCP</> : <>transformación<br />en tiempo real</>}</span></div></section>

    {mode !== 'architecture' && <div className="section-tabs"><button className={`section-tab ${view === 'workbench' ? 'active' : ''}`} onClick={() => setView('workbench')}><Play size={14} /> probar</button><button className={`section-tab ${view === 'api' ? 'active' : ''}`} onClick={() => { setView('api'); void loadApiStatus() }}><SquareActivity size={14} /> API / Swagger</button>{mode === 'transform' && <button className={`section-tab ${view === 'database' ? 'active' : ''}`} onClick={() => { setView('database'); void loadCatalog() }}><Database size={14} /> base de datos</button>}</div>}

    {mode === 'architecture' ? <ArchitectureView /> : view === 'api' ? <ApiInspector info={apiInfo} spec={apiSpec} specUrl={`${apiBase}/openapi.json`} loading={inspectorLoading} onRefresh={() => void loadApiStatus()} /> : view === 'database' ? <DatabaseInspector catalog={catalog} loading={inspectorLoading} onRefresh={() => void loadCatalog()} /> : <section className="workbench">
      <div className="panel input-panel"><div className="panel-header"><div className="panel-title"><span className="panel-index">A</span><div><strong>Entrada</strong><small>JSON plano</small></div></div><div className="panel-actions"><button className="quiet-button" onClick={formatInput} title="Formatear JSON"><Code2 size={15} /> formatear</button><button className="icon-button subtle" onClick={clearAll} title="Limpiar entrada"><RotateCcw size={15} /></button></div></div><div className="editor-wrap"><div className="line-numbers">{input.split('\n').map((_, index) => <span key={index}>{String(index + 1).padStart(2, '0')}</span>)}</div><textarea aria-label="JSON de entrada" spellCheck={false} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Pega aquí el JSON plano..." /></div><div className="panel-footer"><span><FileJson size={14} /> {input.length} caracteres</span><span className={parsedInput.error ? 'parse-bad' : 'parse-ok'}>{parsedInput.error ? 'JSON inválido' : 'JSON válido'} <span className="tiny-dot" /></span></div></div>
      <div className="flow-rail"><div className="flow-line" /><button className="run-button transition-transform" onClick={transformJson} disabled={isLoading} title={mode === 'route' ? 'Calcular ruta' : 'Transformar JSON'}>{isLoading ? <span className="spinner" /> : <Play size={17} fill="currentColor" />}<span>{isLoading ? 'procesando' : mode === 'route' ? 'calcular ruta' : 'transformar'}</span></button><div className="flow-line" /></div>
      <div className="panel output-panel"><div className="panel-header"><div className="panel-title"><span className="panel-index output-index">B</span><div><strong>Salida</strong><small>{mode === 'route' ? 'route response' : 'core response'}</small></div></div>{result && <button className="quiet-button" onClick={copyResult}>{copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? 'copiado' : 'copiar JSON'}</button>}</div><div className="json-viewer">{result ? <JsonNode value={result} /> : <div className="empty-state"><div className="empty-icon"><WandSparkles size={21} /></div><strong>Tu respuesta aparecerá aquí</strong><span>{mode === 'route' ? 'Ejecuta Dijkstra para inspeccionar el depósito y camino elegidos.' : 'Ejecuta una transformación para inspeccionar el payload del core.'}</span></div>}</div><div className="panel-footer"><span><Code2 size={14} /> {result ? `${countKeys(result)} claves` : 'esperando entrada'}</span><span className="output-ready"><span className="tiny-dot" /> {result ? mode === 'route' ? 'ruta calculada' : 'transformado' : 'sin ejecutar'}</span></div></div>
    </section>}

    {error && <div className="error-banner"><X size={16} /><span>{error}</span><button onClick={() => setError('')}><X size={14} /></button></div>}
    <footer className="footer-note"><span>Construido para flujos de endoso</span><span><Command size={12} /> JSON in · core out</span></footer>
  </main>
}

export default App
