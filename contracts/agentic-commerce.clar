;; Agentic Commerce Contract
;; ERC-8183 equivalent for Stacks
;; Job escrow with x402-style payments
;; Upgradable pattern: Registry (state) + Logic (impl)

;; ============================================
;; Constants
;; ============================================
(define-constant ERR_NOT_OWNER (err u200))
(define-constant ERR_NOT_AUTHORIZED (err u201))
(define-constant ERR_JOB_NOT_FOUND (err u202))
(define-constant ERR_INVALID_STATUS (err u203))
(define-constant ERR_JOB_EXPIRED (err u204))
(define-constant ERR_INVALID_BUDGET (err u205))
(define-constant ERR_TRANSFER_FAILED (err u206))
(define-constant ERR_NOT_CLIENT (err u207))
(define-constant ERR_NOT_PROVIDER (err u208))
(define-constant ERR_NOT_EVALUATOR (err u209))
(define-constant ERR_ALREADY_FUNDED (err u210))
(define-constant ERR_NOT_FUNDED (err u211))

;; Status constants
(define-constant STATUS_OPEN u0)
(define-constant STATUS_FUNDED u1)
(define-constant STATUS_SUBMITTED u2)
(define-constant STATUS_COMPLETED u3)
(define-constant STATUS_REJECTED u4)
(define-constant STATUS_EXPIRED u5)

;; ============================================
;; Data vars
;; ============================================
(define-data-var contract-owner principal tx-sender)
(define-data-var job-counter uint u0)
(define-data-var current-implementation principal tx-sender)

;; ============================================
;; Maps
;; ============================================
(define-map jobs uint {
  client: principal,
  provider: (optional principal),
  evaluator: principal,
  description: (string-ascii 512),
  budget: uint,
  expired-at: uint,
  status: uint,
  deliverable: (optional (buff 64))
})

;; Track escrow balances per job
(define-map escrow-balances uint uint)

(define-map protocol-callers principal bool)

;; ============================================
;; Private functions
;; ============================================
(define-private (is-owner (caller principal))
  (is-eq caller (var-get contract-owner))
)

(define-private (is-valid-status-transition (current uint) (next uint))
  (or
    (and (is-eq current STATUS_OPEN) (is-eq next STATUS_FUNDED))
    (and (is-eq current STATUS_FUNDED) (is-eq next STATUS_SUBMITTED))
    (and (is-eq current STATUS_SUBMITTED) (or (is-eq next STATUS_COMPLETED) (is-eq next STATUS_REJECTED)))
    (and (is-eq current STATUS_OPEN) (is-eq next STATUS_EXPIRED))
    (and (is-eq current STATUS_FUNDED) (is-eq next STATUS_EXPIRED))
  )
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

(define-read-only (get-job (job-id uint))
  (match (map-get? jobs job-id)
    job (ok job)
    ERR_JOB_NOT_FOUND
  )
)

(define-read-only (get-job-count)
  (ok (var-get job-counter))
)

(define-read-only (get-escrow-balance (job-id uint))
  (ok (default-to u0 (map-get? escrow-balances job-id)))
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
;; Public functions - Job lifecycle
;; ============================================
(define-public (create-job
    (provider (optional principal))
    (evaluator principal)
    (expired-at uint)
    (description (string-ascii 512))
  )
  (let
    (
      (new-id (+ (var-get job-counter) u1))
    )
    (asserts! (> expired-at block-height) ERR_JOB_EXPIRED)
    (asserts! (> (len description) u0) ERR_INVALID_BUDGET)
    
    (map-set jobs new-id {
      client: tx-sender,
      provider: provider,
      evaluator: evaluator,
      description: description,
      budget: u0,
      expired-at: expired-at,
      status: STATUS_OPEN,
      deliverable: none
    })
    
    (var-set job-counter new-id)
    (ok new-id)
  )
)

(define-public (set-budget (job-id uint) (amount uint))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
    )
    (asserts! (is-eq (get status job) STATUS_OPEN) ERR_INVALID_STATUS)
    (asserts! (is-eq (get client job) tx-sender) ERR_NOT_CLIENT)
    (asserts! (> amount u0) ERR_INVALID_BUDGET)
    
    (map-set jobs job-id {
      client: (get client job),
      provider: (get provider job),
      evaluator: (get evaluator job),
      description: (get description job),
      budget: amount,
      expired-at: (get expired-at job),
      status: STATUS_OPEN,
      deliverable: (get deliverable job)
    })
    
    (ok true)
  )
)

(define-public (fund-job (job-id uint))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
      (budget (get budget job))
    )
    (asserts! (is-eq (get status job) STATUS_OPEN) ERR_INVALID_STATUS)
    (asserts! (is-eq (get client job) tx-sender) ERR_NOT_CLIENT)
    (asserts! (> budget u0) ERR_INVALID_BUDGET)
    (asserts! (is-none (map-get? escrow-balances job-id)) ERR_ALREADY_FUNDED)
    
    ;; Transfer STX from client to contract (escrow)
    (try! (stx-transfer? budget tx-sender (as-contract tx-sender)))
    
    ;; Update escrow tracking
    (map-set escrow-balances job-id budget)
    
    ;; Update job status
    (map-set jobs job-id {
      client: (get client job),
      provider: (get provider job),
      evaluator: (get evaluator job),
      description: (get description job),
      budget: budget,
      expired-at: (get expired-at job),
      status: STATUS_FUNDED,
      deliverable: (get deliverable job)
    })
    
    (ok true)
  )
)

(define-public (assign-provider (job-id uint) (provider principal))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
    )
    (asserts! (is-eq (get status job) STATUS_FUNDED) ERR_INVALID_STATUS)
    (asserts! (is-eq (get client job) tx-sender) ERR_NOT_CLIENT)
    
    (map-set jobs job-id {
      client: (get client job),
      provider: (some provider),
      evaluator: (get evaluator job),
      description: (get description job),
      budget: (get budget job),
      expired-at: (get expired-at job),
      status: STATUS_FUNDED,
      deliverable: (get deliverable job)
    })
    
    (ok true)
  )
)

(define-public (submit-work (job-id uint) (deliverable (buff 64)))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
      (provider-opt (get provider job))
    )
    (asserts! (is-eq (get status job) STATUS_FUNDED) ERR_INVALID_STATUS)
    (asserts! (is-some provider-opt) ERR_NOT_PROVIDER)
    (asserts! (is-eq tx-sender (unwrap! provider-opt ERR_NOT_PROVIDER)) ERR_NOT_PROVIDER)
    
    (map-set jobs job-id {
      client: (get client job),
      provider: (get provider job),
      evaluator: (get evaluator job),
      description: (get description job),
      budget: (get budget job),
      expired-at: (get expired-at job),
      status: STATUS_SUBMITTED,
      deliverable: (some deliverable)
    })
    
    (ok true)
  )
)

(define-public (complete-job (job-id uint))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
      (budget (get budget job))
      (provider-opt (get provider job))
    )
    (asserts! (is-eq (get status job) STATUS_SUBMITTED) ERR_INVALID_STATUS)
    (asserts! (is-eq (get evaluator job) tx-sender) ERR_NOT_EVALUATOR)
    (asserts! (is-some provider-opt) ERR_NOT_PROVIDER)
    
    ;; Transfer from escrow to provider
    (try! (as-contract (stx-transfer? budget tx-sender (unwrap! provider-opt ERR_NOT_PROVIDER))))
    
    ;; Clear escrow
    (map-delete escrow-balances job-id)
    
    ;; Update job status
    (map-set jobs job-id {
      client: (get client job),
      provider: (get provider job),
      evaluator: (get evaluator job),
      description: (get description job),
      budget: budget,
      expired-at: (get expired-at job),
      status: STATUS_COMPLETED,
      deliverable: (get deliverable job)
    })
    
    (ok true)
  )
)

(define-public (reject-job (job-id uint))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
      (budget (get budget job))
    )
    (asserts! (is-eq (get status job) STATUS_SUBMITTED) ERR_INVALID_STATUS)
    (asserts! (or (is-eq (get client job) tx-sender) (is-eq (get evaluator job) tx-sender)) ERR_NOT_AUTHORIZED)
    
    ;; Refund escrow to client
    (try! (as-contract (stx-transfer? budget tx-sender (get client job))))
    
    ;; Clear escrow
    (map-delete escrow-balances job-id)
    
    ;; Update job status
    (map-set jobs job-id {
      client: (get client job),
      provider: (get provider job),
      evaluator: (get evaluator job),
      description: (get description job),
      budget: budget,
      expired-at: (get expired-at job),
      status: STATUS_REJECTED,
      deliverable: (get deliverable job)
    })
    
    (ok true)
  )
)

(define-public (expire-job (job-id uint))
  (let
    (
      (job (unwrap! (map-get? jobs job-id) ERR_JOB_NOT_FOUND))
    )
    (asserts! (>= block-height (get expired-at job)) ERR_JOB_EXPIRED)
    (asserts! (or (is-eq (get status job) STATUS_OPEN) (is-eq (get status job) STATUS_FUNDED)) ERR_INVALID_STATUS)
    
    ;; If funded, refund to client
    (if (is-eq (get status job) STATUS_FUNDED)
      (let
        (
          (budget (get budget job))
        )
        (try! (as-contract (stx-transfer? budget tx-sender (get client job))))
        (map-delete escrow-balances job-id)
        (map-set jobs job-id {
          client: (get client job),
          provider: (get provider job),
          evaluator: (get evaluator job),
          description: (get description job),
          budget: budget,
          expired-at: (get expired-at job),
          status: STATUS_EXPIRED,
          deliverable: (get deliverable job)
        })
      )
      (map-set jobs job-id {
        client: (get client job),
        provider: (get provider job),
        evaluator: (get evaluator job),
        description: (get description job),
        budget: (get budget job),
        expired-at: (get expired-at job),
        status: STATUS_EXPIRED,
        deliverable: (get deliverable job)
      })
    )
    
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
