<!-- généré par daroms : ne pas modifier à la main -->
# Catalogue @daroms/ui

Lire ce fichier, jamais les sources. Import : `import { Button, Screen } from '@daroms/ui'`.
Primitives de mise en page : `XStack`, `YStack`, `ScrollView`, `Separator`, `Spacer`, `Theme` (aussi exportées).
« + props de style » : le conteneur accepte les props de style Tamagui à tokens (`<ListItem py="tight" />`), après ses valeurs par défaut ; type `StyleProps`.

| Composant | Props clés | Exemple |
|---|---|---|
| Avatar | name (initiales de repli, a11y) · uri · size: sm\|md\|lg\|xl · + props de style | `<Avatar name={profile.display_name} uri={profile.avatar_url} size="lg" />` |
| Badge | tone: neutral\|brand\|accent\|success\|warning\|danger · children (texte court) · + props de style | `<Badge tone="success">{t('order.paid')}</Badge>` |
| BarChart | data[{ key, label, value }] · label (a11y, requis) · max (défaut : plus grande valeur) · tone: brand\|accent\|success · height (token, défaut 40) · highlight (key mise en avant) · + props de style | `<BarChart data={lastDays(entries, (e) => e.date).map((d) => ({ key: d.day, label: formatWeekday(d.day, 'narrow'), value: d.value }))} label={t('stats.week')} />` |
| Button | variant: primary (dégradé en direction soft et vivid)\|secondary\|outline\|ghost\|danger · size: sm\|md\|lg (défaut lg) · loading · icon · iconAfter · fullWidth · haptic | `<Button icon={Plus} loading={create.isPending} onPress={submit}>{t('todos.add')}</Button>` |
| Card | pressable (retour visuel) · flat (sans bordure ni ombre) · padded (défaut true) · elevation: 0\|1\|2 (défaut : relief de la direction) · + props YStack | `<Card pressable onPress={() => open(item.id)}><Body>{item.title}</Body></Card>` |
| Chip | label · selected · icon · onPress (filtres, tags) · + props de style | `<Chip label={t('filters.today')} selected={filter === 'today'} onPress={() => setFilter('today')} />` |
| Dialog | open · onOpenChange · title · description · confirmLabel · cancelLabel · destructive · loading · onConfirm · + props de style (fenêtre) | `<Dialog open={confirm} onOpenChange={setConfirm} title={t('todo.deleteTitle')} destructive onConfirm={remove} />` |
| EmptyState | illustration (défaut empty) ou icon · title · description · actionLabel + onAction (textes par défaut fournis) · + props de style | `<EmptyState illustration="calendar" title={t('todos.emptyTitle')} actionLabel={t('todos.add')} onAction={openSheet} />` |
| ErrorState | error (AppError traduite automatiquement) · title · description · onRetry (bouton Réessayer) · + props de style | `<ErrorState error={query.error} onRetry={() => query.refetch()} />` |
| FormField | control · name · label · hint · + props Input (secureTextEntry, keyboardType...). Messages zod = clés i18n. testID e2e : field-<name> | `<FormField control={form.control} name="email" label={t('auth.email')} keyboardType="email-address" />` |
| Gradient | kind: brand (dégradé de marque) \| halo (fond clair à deux lueurs) · angle (défaut 135) · + props de style (rounded, opacity) | `<Card position="relative" padded={false}><Gradient kind="halo" /><YStack p="stack">...</YStack></Card> (le parent porte position="relative")` |
| Header | title · subtitle · back (true \| fn) · right · large · + props de style | `<Header title={t('todo.title')} back right={<IconButton icon={Trash2} label={t('actions.delete')} onPress={remove} />} />` |
| Hero | title · subtitle · illustration (nom de scène) · tone: halo (fond clair à lueurs, défaut) \| brand (dégradé plein, texte clair) · children (actions) · + props de style | `<Hero illustration="growth" title={t('home.title')} subtitle={t('home.subtitle')}><Button>{t('home.start')}</Button></Hero>` |
| IconButton | icon (requis) · label (requis, a11y) · variant (défaut ghost) · size: sm\|md\|lg | `<IconButton icon={Settings} label={t('settings.title')} onPress={open} />` |
| Illustration | name: welcome\|growth\|chat\|secure\|empty\|success\|calendar\|focus\|community\|spark · size: sm\|md\|lg (défaut md) · animated (défaut true : entrée puis flottement lent, coupé si « réduire les animations ») · + props de style | `<Illustration name="growth" size="lg" />` |
| Image | source (uri ou require) · alt (requis) · ratio · rounded (défaut card) · contentFit · placeholder (blurhash) · + props de style | `<Image source={product.image_url} alt={product.name} ratio={4 / 3} />` |
| Input | value · onChangeText · placeholder · invalid · secureTextEntry · keyboardType · autoComplete | `<Input value={query} onChangeText={setQuery} placeholder={t('search.placeholder')} />` |
| List | data · renderItem (item mémoïsé) · keyExtractor · loading · error · onRetry · empty (ou ListEmptyComponent) · onRefresh · refreshing · separators | `<List data={todos.data} loading={todos.isPending} error={todos.error} onRetry={todos.refetch} renderItem={renderTodo} />` |
| ListItem | title · subtitle · icon · leading · value · trailing · chevron · destructive · onPress · + props de style | `<ListItem title={item.title} subtitle={formatRelative(item.created_at)} chevron onPress={open} />` |
| OnboardingPager | pages[{ key, illustration (scène, prioritaire) ou icon, title, description }] · onDone · doneLabel · + props de style | `<OnboardingPager pages={pages} onDone={finish} />` |
| Paywall | title · subtitle · features[] · plans[{id,title,price,period,badge,trialDays}] · selectedId · onSelect · ctaLabel · onPurchase · onRestore · onClose · purchasing · termsUrl · privacyUrl · + props de style (contenu) | `<Paywall {...paywall} /> (branché par le module payments)` |
| ProgressBar | value (0 à 1) · tone: brand\|accent\|success · + props de style (piste) | `<ProgressBar value={done / total} tone="success" />` |
| QueryView | query (useQuery) · children(data) · skeleton · empty (EmptyState) · isEmpty. Gère les 4 états d'un écran. | `<QueryView query={todos} empty={{ title: t('todos.empty') }}>{(items) => <TodoList items={items} />}</QueryView>` |
| Reveal | children (chaque enfant entre l'un après l'autre) · delay (ms avant le premier, défaut 0) · step (ms entre deux, défaut 70) | `<Reveal><Title>{t('home.title')}</Title><Body>{t('home.subtitle')}</Body><Button>{t('home.start')}</Button></Reveal>` |
| Screen | scroll · padded · header · footer · keyboard · onRefresh + refreshing · safeTop · + props de style (contenu) | `<Screen header={<Header title={t('home.title')} large />} onRefresh={q.refetch} refreshing={q.isRefetching}>...</Screen>` |
| SegmentedControl | options [{ value, label }] · value · onChange (2 à 4 choix exclusifs) · + props de style | `<SegmentedControl options={periods} value={period} onChange={setPeriod} />` |
| SettingsList | sections[{ key, title, items[{ key, label, icon, type: link\|toggle\|action, value, checked, selected, onToggle, onPress, destructive }] }] · + props de style | `<SettingsList sections={sections} /> (utilisé par le module settings)` |
| Sheet | open · onOpenChange · title · snapPoints (défaut [60]) · scroll · + props de style (contenu) | `<Sheet open={open} onOpenChange={setOpen} title={t('todos.new')}><TodoForm onDone={() => setOpen(false)} /></Sheet>` |
| Skeleton | w · h (tokens) · rounded · + props de style. SkeletonList : rows, avatar | `<Skeleton w="66%" h="5" /> · <SkeletonList rows={5} avatar />` |
| Stat | value (nombre ou texte formaté) · label · tone: default\|brand\|accent\|success · icon · + props de style. Carte qui s'étire (flex 1) : en XStack pour une rangée de chiffres clés | `<XStack gap="stack"><Stat value={week} label={t('stats.week')} tone="brand" /><Stat value={streak} label={t('stats.streak')} icon={Flame} /></XStack>` |
| Tabs | tabs [{ value, label, count }] · value · onChange (onglets soulignés, défilants) · + props de style | `<Tabs tabs={[{ value: 'all', label: t('tabs.all') }]} value={tab} onChange={setTab} />` |
| Title | tone: default\|muted\|brand\|accent\|danger\|success · align: start\|center\|end | `<Title>{t('home.title')}</Title>` |
| Heading | tone · align · level: 1\|2\|3 (taille 7, 6, 5) | `<Heading level={2}>{t('section.title')}</Heading>` |
| Body | tone · align · weight: regular\|medium\|bold · size: '3'..'5' | `<Body tone="muted">{t('item.description')}</Body>` |
| Caption | tone (défaut muted) · align · weight | `<Caption>{formatRelative(item.created_at)}</Caption>` |
| Toast | <Toaster /> monté une fois à la racine (AppProvider le fait) ; notify.success\|error\|info(message) | `notify.success(t('todos.saved'))` |

## Tokens et thèmes (valeurs plates Tamagui v3, sans `$`)

- Espaces : `gutter` (marge écran), `section`, `stack`, `inline`, `tight` + échelle 4 pt `0`..`96` (`4` = 16 px), demi-pas `0-5`, `1-5`.
- Rayons : `button`, `input`, `card`, `sheet`, `chip`, `badge`, `avatar`, `pill`.
- Couleurs de thème : `background`, `background-hover`, `background-press`, `color` (texte), `color-1`..`color-11` (1 = proche du fond),
  `border-color`, `placeholder-color`, `card`, `separator`, `overlay`, `skeleton` ; absolues : `brand-50`..`brand-950`, `accent-*`, `surface-*`, Tailwind (`emerald-500`...).
- Sous-thèmes (`theme="..."`) : `brand` (plein), `soft`, `accent`, `highlight`, `success`, `warning`, `danger`, `destructive`, `level2`..`level4`, `inverse`.
- Conditions dans la valeur : `bg="card press:background-press dark:surface-900"`, `opacity="1 enter:0 exit:0"`.
- Texte : `size="1"`..`"10"` (11 à 40 px) ; icônes : `size="5"` (échelle de police) et `color="color-9"`.
- Animations : `transition="fast" | "medium" | "slow" | "bouncy"` (ressorts réglés par le ton de marque).

## Icônes Lucide (102) : `import { Plus } from '@daroms/ui/icons'`

Autre icône : `bun daroms icons add NomLucide` (jamais d'autre jeu).

Activity, ArrowLeft, ArrowRight, Bell, BookOpen, Bookmark, Bot, Calendar, Camera, ChartColumn, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleAlert, CircleCheck, CircleHelp, CirclePlus, Clock, Coffee, Compass, Copy, CreditCard, Crown, Download, Dumbbell, Ellipsis, ExternalLink, Eye, EyeOff, FileText, Filter, Flame, Gift, Globe, Heart, Home, House, Image, Inbox, Info, KeyRound, Languages, Layers, LayoutGrid, Leaf, Link, List, ListChecks, Lock, LogIn, LogOut, Mail, MapPin, Menu, MessageCircle, Mic, Minus, Moon, Music, Notebook, Package, Palette, Pause, Pencil, Phone, Play, Plus, RefreshCw, Search, Send, Settings, Share2, Shield, ShoppingBag, ShoppingCart, SlidersHorizontal, Smartphone, Smile, Sparkles, SquarePen, Star, Store, Sun, Tag, Target, ThumbsUp, Trash2, TrendingUp, TriangleAlert, Trophy, Upload, User, UserRound, Users, Vibrate, Wallet, Wifi, WifiOff, X, Zap
