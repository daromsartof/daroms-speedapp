<!-- généré par daroms : ne pas modifier à la main -->
# Catalogue @daroms/ui

Lire ce fichier, jamais les sources. Import : `import { Button, Screen } from '@daroms/ui'`.
Primitives de mise en page : `XStack`, `YStack`, `ScrollView`, `Separator`, `Spacer`, `Theme` (aussi exportées).

| Composant | Props clés | Exemple |
|---|---|---|
| Avatar | name (initiales de repli, a11y) · uri · size: sm\|md\|lg\|xl | `<Avatar name={profile.display_name} uri={profile.avatar_url} size="lg" />` |
| Badge | tone: neutral\|brand\|accent\|success\|warning\|danger · children (texte court) | `<Badge tone="success">{t('order.paid')}</Badge>` |
| Button | variant: primary\|secondary\|outline\|ghost\|danger · size: sm\|md\|lg (défaut lg) · loading · icon · iconAfter · fullWidth · haptic | `<Button icon={Plus} loading={create.isPending} onPress={submit}>{t('todos.add')}</Button>` |
| Card | pressable (retour visuel) · flat (sans bordure) · padded (défaut true) · + props YStack | `<Card pressable onPress={() => open(item.id)}><Body>{item.title}</Body></Card>` |
| Chip | label · selected · icon · onPress (filtres, tags) | `<Chip label={t('filters.today')} selected={filter === 'today'} onPress={() => setFilter('today')} />` |
| Dialog | open · onOpenChange · title · description · confirmLabel · cancelLabel · destructive · loading · onConfirm | `<Dialog open={confirm} onOpenChange={setConfirm} title={t('todo.deleteTitle')} destructive onConfirm={remove} />` |
| EmptyState | icon · title · description · actionLabel + onAction (textes par défaut fournis) | `<EmptyState icon={ListChecks} title={t('todos.emptyTitle')} actionLabel={t('todos.add')} onAction={openSheet} />` |
| ErrorState | error (AppError traduite automatiquement) · title · description · onRetry (bouton Réessayer) | `<ErrorState error={query.error} onRetry={() => query.refetch()} />` |
| FormField | control · name · label · hint · + props Input (secureTextEntry, keyboardType...). Messages zod = clés i18n. | `<FormField control={form.control} name="email" label={t('auth.email')} keyboardType="email-address" />` |
| Header | title · subtitle · back (true \| fn) · right · large | `<Header title={t('todo.title')} back right={<IconButton icon={Trash2} label={t('actions.delete')} onPress={remove} />} />` |
| IconButton | icon (requis) · label (requis, a11y) · variant (défaut ghost) · size: sm\|md\|lg | `<IconButton icon={Settings} label={t('settings.title')} onPress={open} />` |
| Image | source (uri ou require) · alt (requis) · ratio · rounded (défaut card) · contentFit · placeholder (blurhash) | `<Image source={product.image_url} alt={product.name} ratio={4 / 3} />` |
| Input | value · onChangeText · placeholder · invalid · secureTextEntry · keyboardType · autoComplete | `<Input value={query} onChangeText={setQuery} placeholder={t('search.placeholder')} />` |
| List | data · renderItem (item mémoïsé) · keyExtractor · loading · error · onRetry · empty (ou ListEmptyComponent) · onRefresh · refreshing · separators | `<List data={todos.data} loading={todos.isPending} error={todos.error} onRetry={todos.refetch} renderItem={renderTodo} />` |
| ListItem | title · subtitle · icon · leading · value · trailing · chevron · destructive · onPress | `<ListItem title={item.title} subtitle={formatRelative(item.created_at)} chevron onPress={open} />` |
| OnboardingPager | pages[{ key, icon, title, description }] · onDone · doneLabel | `<OnboardingPager pages={pages} onDone={finish} />` |
| Paywall | title · subtitle · features[] · plans[{id,title,price,period,badge,trialDays}] · selectedId · onSelect · ctaLabel · onPurchase · onRestore · onClose · purchasing · termsUrl · privacyUrl | `<Paywall {...paywall} /> (branché par le module payments)` |
| ProgressBar | value (0 à 1) · tone: brand\|accent\|success | `<ProgressBar value={done / total} tone="success" />` |
| QueryView | query (useQuery) · children(data) · skeleton · empty (EmptyState) · isEmpty. Gère les 4 états d'un écran. | `<QueryView query={todos} empty={{ title: t('todos.empty') }}>{(items) => <TodoList items={items} />}</QueryView>` |
| Screen | scroll · padded · header · footer · keyboard · onRefresh + refreshing · safeTop | `<Screen header={<Header title={t('home.title')} large />} onRefresh={q.refetch} refreshing={q.isRefetching}>...</Screen>` |
| SegmentedControl | options [{ value, label }] · value · onChange (2 à 4 choix exclusifs) | `<SegmentedControl options={periods} value={period} onChange={setPeriod} />` |
| SettingsList | sections[{ key, title, items[{ key, label, icon, type: link\|toggle\|action, value, checked, selected, onToggle, onPress, destructive }] }] | `<SettingsList sections={sections} /> (utilisé par le module settings)` |
| Sheet | open · onOpenChange · title · snapPoints (défaut [60]) · scroll | `<Sheet open={open} onOpenChange={setOpen} title={t('todos.new')}><TodoForm onDone={() => setOpen(false)} /></Sheet>` |
| Skeleton | w · h (tokens) · rounded. SkeletonList : rows, avatar | `<Skeleton w="66%" h="5" /> · <SkeletonList rows={5} avatar />` |
| Tabs | tabs [{ value, label, count }] · value · onChange (onglets soulignés, défilants) | `<Tabs tabs={[{ value: 'all', label: t('tabs.all') }]} value={tab} onChange={setTab} />` |
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
