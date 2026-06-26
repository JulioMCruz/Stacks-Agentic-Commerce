;; Agent Registry Contract
;; ERC-8004 equivalent for Stacks
;; Upgradable pattern: Registry (state) + Logic (impl)

;; ============================================
;; Constants
;; ============================================
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_AUTHORIZED (err u101))
(define-constant ERR_AGENT_NOT_FOUND (err u102))
(define-constant ERR_INVALID_NAME (err u103))
(define-constant ERR_INVALID_DESCRIPTION (err u104))

;; ============================================
;; Data vars
;; ============================================
(define-data-var contract-owner principal tx-sender)
(define-data-var agent-counter uint u0)
(define-data-var current-implementation principal tx-sender)

;; ============================================
;; Maps
;; ============================================
(define-map agents uint {
  name: (string-ascii 64),
  description: (string-ascii 256),
  creator: principal,
  wallet: principal,
  active: bool,
  endpoints: (list 10 {name: (string-ascii 32), url: (string-ascii 128)})
})

(define-map protocol-callers principal bool)

;; ============================================
;; Private functions
;; ============================================
(define-private (is-owner (caller principal))
  (is-eq caller (var-get contract-owner))
)

;; ============================================
;; Read-only functions
;; ============================================
(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (is-protocol-caller (caller principal))
  (default-to false (map-get? protocol-callers caller))
)

(define-read-only (get-agent (agent-id uint))
  (match (map-get? agents agent-id)
    agent (ok agent)
    ERR_AGENT_NOT_FOUND
  )
)

(define-read-only (get-agent-count)
  (ok (var-get agent-counter))
)

(define-read-only (get-current-implementation)
  (ok (var-get current-implementation))
)

;; ============================================
;; Public functions - Access control
;; ============================================
(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (var-set contract-owner new-owner)
    (ok true)
  )
)

(define-public (add-protocol-caller (caller principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set protocol-callers caller true)
    (ok true)
  )
)

(define-public (remove-protocol-caller (caller principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set protocol-callers caller false)
    (ok true)
  )
)

;; ============================================
;; Public functions - Agent registry
;; ============================================
(define-public (register-agent
    (name (string-ascii 64))
    (description (string-ascii 256))
    (wallet principal)
    (endpoints (list 10 {name: (string-ascii 32), url: (string-ascii 128)}))
  )
  (let
    (
      (new-id (+ (var-get agent-counter) u1))
    )
    (asserts! (> (len name) u0) ERR_INVALID_NAME)
    (asserts! (> (len description) u0) ERR_INVALID_DESCRIPTION)
    
    (map-set agents new-id {
      name: name,
      description: description,
      creator: tx-sender,
      wallet: wallet,
      active: true,
      endpoints: endpoints
    })
    
    (var-set agent-counter new-id)
    (ok new-id)
  )
)

(define-public (update-agent
    (agent-id uint)
    (new-name (optional (string-ascii 64)))
    (new-description (optional (string-ascii 256)))
    (new-wallet (optional principal))
  )
  (let
    (
      (agent (unwrap! (map-get? agents agent-id) ERR_AGENT_NOT_FOUND))
    )
    (asserts! (is-eq (get creator agent) tx-sender) ERR_NOT_AUTHORIZED)
    
    (map-set agents agent-id {
      name: (default-to (get name agent) new-name),
      description: (default-to (get description agent) new-description),
      creator: (get creator agent),
      wallet: (default-to (get wallet agent) new-wallet),
      active: (get active agent),
      endpoints: (get endpoints agent)
    })
    
    (ok true)
  )
)

(define-public (deactivate-agent (agent-id uint))
  (let
    (
      (agent (unwrap! (map-get? agents agent-id) ERR_AGENT_NOT_FOUND))
    )
    (asserts! (is-eq (get creator agent) tx-sender) ERR_NOT_AUTHORIZED)
    
    (map-set agents agent-id {
      name: (get name agent),
      description: (get description agent),
      creator: (get creator agent),
      wallet: (get wallet agent),
      active: false,
      endpoints: (get endpoints agent)
    })
    
    (ok true)
  )
)

;; ============================================
;; Public functions - Upgrade
;; ============================================
(define-public (upgrade-implementation (new-impl principal))
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (var-set current-implementation new-impl)
    (ok true)
  )
)
