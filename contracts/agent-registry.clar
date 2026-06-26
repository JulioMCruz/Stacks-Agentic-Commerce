;; Agent Registry Contract
;; Patrón upgradable: Registry (estado) + Logic (impl)
;; Estado guardado en registry, logica puede ser actualizada

;; Data var: agentes registrados
(define-data-var agents (list 100 (tuple (id uint) (name string-64) (description string-256) (creator principal) (wallet principal) (active bool) (endpoints (list 10 (tuple (name string-32) (url string-128)))))))

;; Data var: contador de agents
(define-data-var agent-counter uint u0)

;; Data var: owner del contrato
(define-data-var owner principal tx-sender)

;; Data var: lista de protocol callers autorizados
(define-map protocol-callers principal bool)

;; Data var: implementation actual (principal)
(define-data-var current-implementation principal tx-sender)

;; Constantes de error
(define-constant ERR_NOT_OWNER (err u1))
(define-constant ERR_NOT_AUTHORIZED (err u2))
(define-constant ERR_NOT_UPGRADABLE (err u3))

;; ============================================
;; Funciones de access control
;; ============================================

(define-read-only (is-owner (caller principal)))
  (is-eq caller (var-get owner))

(define-read-only (is-protocol-caller (caller principal)))
  (default-to false (map-get? protocol-callers caller))

(define-public (set-owner (new-owner principal)))
  (begin
    (asserts (is-owner tx-sender) ERR_NOT_OWNER)
    (var-set owner new-owner)
    (ok true)
  )

(define-public (add-protocol-caller (caller principal)))
  (begin
    (asserts (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set protocol-callers caller true)
    (ok true)
  )

(define-public (remove-protocol-caller (caller principal)))
  (begin
    (asserts (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set protocol-callers caller false)
    (ok true)
  )

;; ============================================
;; Funciones del agent registry
;; ============================================

(define-public (register-agent (name string-64) (description string-256) (wallet principal) (endpoints (list 10 (tuple (name string-32) (url string-128))))))
  (begin
    (print u"registering new agent")
    (var-set agent-counter (+ (var-get agent-counter) u1))
    (var-set agents (append (var-get agents) (list (tuple (id (var-get agent-counter)) (name name) (description description) (creator tx-sender) (wallet wallet) (active true) (endpoints endpoints)))))
    (ok (var-get agent-counter))
  )

(define-read-only (get-agent (agent-id uint)))
  (match (list-nth? (var-get agents) agent-id) 
    agent (ok agent) 
    err (err u1)
  )

(define-read-only (agent-count))
  (ok (len (var-get agents)))

(define-public (update-agent (agent-id uint) (new-name (optional string-64)) (new-description (optional string-256)) (new-wallet (optional principal))))
  (match (list-nth? (var-get agents) agent-id)
    agent
    (begin
      (asserts (is-eq (get creator agent) tx-sender) ERR_NOT_AUTHORIZED)
      (var-set agents (list-set (var-get agents) agent-id (tuple 
        (id (get id agent))
        (name (default-to (get name agent) new-name))
        (description (default-to (get description agent) new-description))
        (creator (get creator agent))
        (wallet (default-to (get wallet agent) new-wallet))
        (active (get active agent))
        (endpoints (get endpoints agent))
      )))
      (ok true)
    )
    err (err u1)
  )

(define-public (deactivate-agent (agent-id uint)))
  (match (list-nth? (var-get agents) agent-id)
    agent
    (begin
      (asserts (is-eq (get creator agent) tx-sender) ERR_NOT_AUTHORIZED)
      (var-set agents (list-set (var-get agents) agent-id (tuple 
        (id (get id agent))
        (name (get name agent))
        (description (get description agent))
        (creator (get creator agent))
        (wallet (get wallet agent))
        (active false)
        (endpoints (get endpoints agent))
      )))
      (ok true)
    )
    err (err u1)
  )

;; ============================================
;; Funciones de upgrade
;; ============================================

(define-public (upgrade-implementation (new-impl principal)))
  (begin
    (asserts (is-owner tx-sender) ERR_NOT_OWNER)
    (var-set current-implementation new-impl)
    (print (concat u"contract upgraded to " new-impl))
    (ok true)
  )

(define-read-only (get-current-implementation))
  (ok (var-get current-implementation))
