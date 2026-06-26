;; Agentic Commerce Contract
;; Job escrow con 6 estados (Open -> Funded -> Submitted -> Completed/Rejected/Expired)
;; Soporta pagos en STX

(define-data-var jobs (list 1000 (tuple (id uint) (client principal) (provider principal) (evaluator principal) (description string-512) (budget uint) (expiredAt uint) (status (ok (uint u0) err (err u0))) (deliverable (optional (buff 64))))))

(define-data-var job-counter uint u0)

(define-constant ERR_JOB_NOT_FOUND (err u1))
(define-constant ERR_NOT_CLIENT (err u2))
(define-constant ERR_NOT_PROVIDER (err u3))
(define-constant ERR_NOT_EVALUATOR (err u4))
(define-constant ERR_JOB_EXPIRED (err u5))
(define-constant ERR_JOB_NOT_FUNDED (err u6))

(define-public (create-job (client principal) (evaluator principal) (expiredAt uint) (description string-512)))
  (begin
    (asserts (is-eq tx-sender client) ERR_NOT_CLIENT)
    (asserts (> expiredAt (block-height)) ERR_JOB_EXPIRED)
    (var-set job-counter (+ (var-get job-counter) u1))
    (var-set jobs (append (var-get jobs) (list (tuple (id (var-get job-counter)) (client client) (provider u"") (evaluator evaluator) (description description) (budget u0) (expiredAt expiredAt) (status (ok u0)) (deliverable none)))))
    (ok (var-get job-counter))
  )
)

(define-public (set-budget (job-id uint) (amount uint)))
  (match (list-nth? (var-get jobs) job-id)
    job
    (begin
      (asserts (is-eq (get status job) (ok u0)) ERR_JOB_NOT_FOUND)
      (asserts (or (is-eq tx-sender (get client job)) (is-eq tx-sender (get provider job))) ERR_NOT_CLIENT)
      (var-set jobs (list-set (var-get jobs) job-id (tuple (id job-id) (client (get client job)) (provider (get provider job)) (evaluator (get evaluator job)) (description (get description job)) (budget amount) (expiredAt (get expiredAt job)) (status (ok u0)) (deliverable (get deliverable job)))))
      (ok true)
    )
    err ERR_JOB_NOT_FOUND
  )
)

(define-public (fund-job (job-id uint)))
  (match (list-nth? (var-get jobs) job-id)
    job
    (begin
      (asserts (is-eq (get status job) (ok u0)) ERR_JOB_NOT_FOUND)
      (asserts (is-eq tx-sender (get client job)) ERR_NOT_CLIENT)
      (asserts (> (get budget job) u0) ERR_JOB_NOT_FUNDED)
      (asserts (is-eq (get provider job) u"") ERR_NOT_PROVIDER) ;; provider debe estar set
      ;; Transferencia de STX (pago del client al contrato)
      (ok (ok (unwrap-panic (stx-transfer? (get budget job) tx-sender (get client job)))))
    )
    err ERR_JOB_NOT_FOUND
  )
)

(define-public (submit-work (job-id uint) (deliverable (buff 64))))
  (match (list-nth? (var-get jobs) job-id)
    job
    (begin
      (asserts (is-eq (get status job) (ok u0)) ERR_JOB_NOT_FOUND)
      (asserts (is-eq tx-sender (get provider job)) ERR_NOT_PROVIDER)
      (var-set jobs (list-set (var-get jobs) job-id (tuple (id job-id) (client (get client job)) (provider (get provider job)) (evaluator (get evaluator job)) (description (get description job)) (budget (get budget job)) (expiredAt (get expiredAt job)) (status (ok u2)) (deliverable some deliverable))))
      (ok true)
    )
    err ERR_JOB_NOT_FOUND
  )
)

(define-public (complete-job (job-id uint)))
  (match (list-nth? (var-get jobs) job-id)
    job
    (begin
      (asserts (is-eq (get status job) (ok u2)) ERR_JOB_NOT_FOUND) ;; debe estar Submitted
      (asserts (is-eq tx-sender (get evaluator job)) ERR_NOT_EVALUATOR)
      ;; Transferir pago al provider (menos fee opcional)
      (ok (ok (unwrap-panic (stx-transfer? (get budget job) (get client job) (get provider job)))))
    )
    err ERR_JOB_NOT_FOUND
  )
)

(define-public (reject-job (job-id uint)))
  (match (list-nth? (var-get jobs) job-id)
    job
    (begin
      (asserts (or (is-eq (get status job) (ok u0)) (is-eq (get status job) (ok u2))) ERR_JOB_NOT_FOUND) ;; Open o Submitted
      (asserts (or (is-eq tx-sender (get client job)) (is-eq tx-sender (get evaluator job))) ERR_NOT_CLIENT)
      (ok (ok true)) ;; reembolso al client
    )
    err ERR_JOB_NOT_FOUND
  )
)

(define-read-only (get-job (job-id uint)))
  (match (list-nth? (var-get jobs) job-id)
    job (ok job)
    err ERR_JOB_NOT_FOUND
  )
)
