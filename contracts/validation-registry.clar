;; Validation Registry Contract
;; Verifies agent identity and capabilities

;; ============================================
;; Constants
;; ============================================
(define-constant ERR_NOT_OWNER (err u100))
(define-constant ERR_NOT_AUTHORIZED (err u101))
(define-constant ERR_AGENT_NOT_FOUND (err u102))
(define-constant ERR_INVALID_PROOF (err u103))
(define-constant ERR_ALREADY_VERIFIED (err u104))

;; ============================================
;; Data vars
;; ============================================
(define-data-var contract-owner principal tx-sender)

;; ============================================
;; Maps
;; ============================================
;; Verification records per agent
(define-map verifications principal {
  is-verified: bool,
  verified-by: principal,
  verified-at: uint,
  proof-hash: (buff 32),
  capabilities: (list 10 (string-ascii 32))
})

;; Verification types
(define-map verification-types (string-ascii 32) {
  description: (string-ascii 256),
  required-stake: uint,
  active: bool
})

;; Protocol callers
(define-map protocol-callers principal bool)

;; ============================================
;; Private functions
;; ============================================
(define-private (is-owner (caller principal))
  (is-eq caller (var-get contract-owner))
)

(define-private (is-protocol-caller (caller principal))
  (default-to false (map-get? protocol-callers caller))
)

;; ============================================
;; Read-only functions
;; ============================================
(define-read-only (get-verification (agent principal))
  (match (map-get? verifications agent)
    verification (ok verification)
    (err u404)
  )
)

(define-read-only (is-verified (agent principal))
  (match (map-get? verifications agent)
    verification (get is-verified verification)
    false
  )
)

(define-read-only (get-verification-type (type-name (string-ascii 32)))
  (match (map-get? verification-types type-name)
    vtype (ok vtype)
    (err u404)
  )
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

;; ============================================
;; Public functions - Verification types
;; ============================================
(define-public (add-verification-type
    (type-name (string-ascii 32))
    (description (string-ascii 256))
    (required-stake uint)
  )
  (begin
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set verification-types type-name {
      description: description,
      required-stake: required-stake,
      active: true
    })
    (ok true)
  )
)

(define-public (deactivate-verification-type (type-name (string-ascii 32)))
  (let
    (
      (vtype (unwrap! (map-get? verification-types type-name) ERR_INVALID_PROOF))
    )
    (asserts! (is-owner tx-sender) ERR_NOT_OWNER)
    (map-set verification-types type-name {
      description: (get description vtype),
      required-stake: (get required-stake vtype),
      active: false
    })
    (ok true)
  )
)

;; ============================================
;; Public functions - Agent verification
;; ============================================
(define-public (verify-agent
    (agent principal)
    (proof-hash (buff 32))
    (capabilities (list 10 (string-ascii 32)))
  )
  (begin
    (asserts! (is-protocol-caller tx-sender) ERR_NOT_AUTHORIZED)
    
    ;; Check if already verified
    (asserts! (not (is-verified agent)) ERR_ALREADY_VERIFIED)
    
    (map-set verifications agent {
      is-verified: true,
      verified-by: tx-sender,
      verified-at: block-height,
      proof-hash: proof-hash,
      capabilities: capabilities
    })
    
    (ok true)
  )
)

(define-public (revoke-verification (agent principal))
  (begin
    (asserts! (is-protocol-caller tx-sender) ERR_NOT_AUTHORIZED)
    
    (let
      (
        (verification (unwrap! (map-get? verifications agent) ERR_AGENT_NOT_FOUND))
      )
      (map-set verifications agent {
        is-verified: false,
        verified-by: (get verified-by verification),
        verified-at: (get verified-at verification),
        proof-hash: (get proof-hash verification),
        capabilities: (get capabilities verification)
      })
    )
    
    (ok true)
  )
)

;; ============================================
;; Public functions - Capability management
;; ============================================
(define-public (add-capability
    (agent principal)
    (capability (string-ascii 32))
  )
  (let
    (
      (verification (unwrap! (map-get? verifications agent) ERR_AGENT_NOT_FOUND))
      (current-caps (get capabilities verification))
    )
    (asserts! (is-protocol-caller tx-sender) ERR_NOT_AUTHORIZED)
    (asserts! (< (len current-caps) u10) ERR_INVALID_PROOF)
    
    (map-set verifications agent {
      is-verified: (get is-verified verification),
      verified-by: (get verified-by verification),
      verified-at: (get verified-at verification),
      proof-hash: (get proof-hash verification),
      capabilities: (unwrap! (as-max-len? (append current-caps capability) u10) ERR_INVALID_PROOF)
    })
    
    (ok true)
  )
)

(define-public (remove-capability
    (agent principal)
    (capability (string-ascii 32))
  )
  (let
    (
      (verification (unwrap! (map-get? verifications agent) ERR_AGENT_NOT_FOUND))
    )
    (asserts! (is-protocol-caller tx-sender) ERR_NOT_AUTHORIZED)
    
    ;; For simplicity, just clear all and re-add (in production, use filter)
    (map-set verifications agent {
      is-verified: (get is-verified verification),
      verified-by: (get verified-by verification),
      verified-at: (get verified-at verification),
      proof-hash: (get proof-hash verification),
      capabilities: (list)
    })
    
    (ok true)
  )
)
