/**
 * Configuração do WPPConnect-Server
 *
 * Este arquivo controla o comportamento do servidor que mantém a sessão do WhatsApp via Chromium.
 * Recomendações:
 * - Em produção, troque `secretKey`, ajuste `host/port` e reduza `log.level` para "info" ou "warn".
 * - Defina `tokenStoreType` e `db` conforme o tipo de armazenamento de sessões/tokens.
 * - Se for usar Webhook (recebimento de mensagens/eventos), preencha `webhook.url`.
 * - Em containers, mantenha `--no-sandbox`/`--disable-dev-shm-usage` nos `browserArgs`.
 */

import { ServerOptions } from './types/ServerOptions';

export default {
  /** Chave usada para assinar/validar requisições ao servidor (autenticação/API). Troque em produção. */
  secretKey: 'THISISMYSECURETOKEN',

  /** Host onde o servidor HTTP escuta (use 0.0.0.0 em containers/VPS). */
  host: 'http://localhost',

  /** Porta do servidor HTTP. */
  port: '21465',

  /** Nome do “dispositivo” apresentado pelo cliente WhatsApp (identificação da sessão). */
  deviceName: 'WppConnect',

  /** Valor enviado no header "X-Powered-By". Apenas informativo. */
  poweredBy: 'WPPConnect-Server',

  /**
   * Se true, ao iniciar o processo o servidor tenta subir TODAS as sessões já existentes no storage.
   * Útil para manter sessões reconectadas após restart.
   */
  startAllSession: true,

  /**
   * Onde armazenar os tokens/sessões:
   * - 'file'  -> disco local (padrão simples, bom para 1 VPS)
   * - 'redis' -> usa Redis (multi-instância, melhor para horizontalizar)
   * - 'mongodb' -> usa MongoDB (persistência centralizada)
   */
  tokenStoreType: 'file',

  /** Limite de listeners do EventEmitter (evita warning "MaxListenersExceededWarning"). */
  maxListeners: 15,

  /**
   * Diretório para dados do usuário/Chromium (perfil do navegador).
   * Mantê-lo persistente ajuda a reduzir re-login/QR a cada reinício.
   */
  customUserDataDir: './userDataDir/',

  /** Configurações de Webhook (envio de eventos/mensagens para sua aplicação). */
  webhook: {
    /**
     * URL do seu endpoint para receber eventos (mensagens, status, acks, etc.).
     * Ex.: 'https://api.seudominio.com/admin/bot/api/wpp/webhook'
     * Deixe null se não for usar webhooks.
     */
    url: null,

    /** Se true, faz download automático de mídias recebidas antes de enviar ao webhook. */
    autoDownload: true,

    /** Se true e S3 configurado, sobe mídias para S3 e envia no webhook o link público. */
    uploadS3: false,

    /** Se true, marca mensagens como lidas automaticamente após recebidas. */
    readMessage: true,

    /** Se true, na inicialização busca e dispara webhooks para mensagens “não lidas”. Cuidado com volume. */
    allUnreadOnStart: false,

    /** Se true, envia webhook quando chegam confirmações (ack) de envio/leitura. */
    listenAcks: true,

    /** Se true, envia webhook quando a presença (digitando/online/offline) de um contato muda. */
    onPresenceChanged: true,

    /** Se true, envia webhook quando participantes de um grupo entram/saem/são alterados. */
    onParticipantsChanged: true,

    /** Se true, envia webhook para reações a mensagens (👍❤️ etc.). */
    onReactionMessage: true,

    /** Se true, envia webhook para respostas de enquetes (polls). */
    onPollResponse: true,

    /** Se true, envia webhook quando uma mensagem é revogada/apagada. */
    onRevokedMessage: true,

    /** Se true, envia webhook quando labels (etiquetas) são atualizadas. */
    onLabelUpdated: true,

    /** Se true, NÃO envia webhook para mensagens que você mesmo enviou (eco). */
    onSelfMessage: false,

    /**
     * Lista de IDs/JIDs a ignorar (não dispara webhook).
     * 'status@broadcast' ignora os status do WhatsApp.
     */
    ignore: ['status@broadcast'],
  },

  /** Configurações de WebSocket (se você expõe eventos também via WS para clientes). */
  websocket: {
    /** Download automático de mídias para eventos transmitidos por WebSocket. */
    autoDownload: false,

    /** Upload automático para S3 de mídias disparadas via WebSocket (se configurado). */
    uploadS3: false,
  },

  /** Integração com Chatwoot (se você usa esse helpdesk). */
  chatwoot: {
    /** Envia QRCode para o Chatwoot quando disponível. */
    sendQrCode: true,

    /** Envia status da sessão para o Chatwoot (conectado, desconectado, etc.). */
    sendStatus: true,
  },

  /** Regras de arquivamento automático de conversas. */
  archive: {
    /** Ativa/desativa o arquivamento automático. */
    enable: false,

    /**
     * Tempo de espera (em segundos) antes de arquivar após a última atividade/checagem.
     * Útil para não arquivar imediatamente em cenários com picos.
     */
    waitTime: 10,

    /** Dias sem atividade a partir dos quais a conversa será arquivada. */
    daysToArchive: 45,
  },

  /** Configuração de logs do servidor. */
  log: {
    /**
     * Nível de log:
     * 'error' | 'warn' | 'info' | 'verbose' | 'debug' | 'silly'
     * Use 'silly' apenas para depuração; em produção, prefira 'info'/'warn'.
     */
    level: 'silly', // Before open a issue, change level to silly and retry a action

    /** Destinos do log: 'console' e/ou 'file'. */
    logger: ['console', 'file'],
  },

  /** Opções de criação da sessão/Chromium. */
  createOptions: {
    /**
     * Flags de inicialização do Chromium (via puppeteer/playwright).
     * Muitas delas reduzem consumo, desativam cache/recursos e melhoram compatibilidade em containers.
     * OBS: há flags duplicadas (ex.: --disable-web-security) — é inofensivo, pode manter.
     * Cuidado: ignorar certificados SSL é conveniente em dev, mas não recomendado em produção.
     */
    browserArgs: [
      '--disable-web-security',
      '--no-sandbox',
      '--disable-web-security', // duplicada, sem impacto prático
      '--aggressive-cache-discard',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
      '--disk-cache-size=0',
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-sync',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
      '--ignore-certificate-errors-spki-list',
    ],

    /**
     * Servidores para gerar link preview (metadados OpenGraph/etc.) de forma confiável.
     * 'null' = usar servidores globais padrão.
     * Para controle total, você pode hospedar seu próprio `wa-js-api-server` (com SSL) e informar aqui.
     * Ex.: linkPreviewApiServers: [ 'https://www.seudominio.com/wa-js-api-server' ]
     */
    linkPreviewApiServers: null,
  },

  /**
   * Mapper é um mecanismo opcional para normalizar/rotular dados conforme integrações externas.
   * Quando habilitado, o `prefix` é aplicado nos identificadores/labels mapeados.
   */
  mapper: {
    /** Ativa o mapper. */
    enable: false,

    /** Prefixo aplicado em elementos mapeados (tags/labels/etc.). */
    prefix: 'tagone-',
  },

  /** Configuração de bancos/cache usados pelo servidor. */
  db: {
    /** Nome do database MongoDB para tokens (se tokenStoreType = 'mongodb'). */
    mongodbDatabase: 'tokens',

    /** Nome da coleção (opcional). */
    mongodbCollection: '',

    /** Credenciais de acesso ao Mongo (se necessário). */
    mongodbUser: '',
    mongodbPassword: '',

    /** Host/porta do Mongo. */
    mongodbHost: '',
    mongoIsRemote: true,
    mongoURLRemote: '', // pode usar string de conexão completa (ex.: Mongo Atlas)
    mongodbPort: 27017,

    /** Configuração do Redis (se usar Redis para cache/filas/session store). */
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,

    /** Prefixo para chaves no Redis (útil para multi-ambiente). */
    redisPrefix: 'docker',
  },

  /** Configuração de upload para Amazon S3 (quando uploadS3 = true). */
  aws_s3: {
    /** Região do bucket (ex.: 'sa-east-1' = São Paulo). */
    region: 'sa-east-1' as any,

    /** Credenciais de acesso (defina via variável de ambiente em produção). */
    access_key_id: null,
    secret_key: null,

    /** Nome do bucket padrão para upload. */
    defaultBucketName: null,

    /** Endpoint custom (S3 compatível como MinIO, Wasabi, etc.). */
    endpoint: null,

    /** Força estilo de path no endpoint (útil para compatibilidade com S3 alternativos). */
    forcePathStyle: null,
  },
} as unknown as ServerOptions;
