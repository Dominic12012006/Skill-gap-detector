import json
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.subject import Subject
from app.models.skill import Skill
from app.models.evidence import Evidence
from app.models.assessment import Assessment, AssessmentItem
from app.models.resource import Resource
from app.services.auth_service import get_password_hash
from app.services.mastery_service import update_all_student_masteries
from app.services.gap_detection_service import detect_and_rank_gaps
from app.services.recommendation_service import refresh_student_recommendations

def seed_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding Users...")
    pw_hash = get_password_hash("password123")
    alex = User(name="Alex Rivera", email="alex@example.com", password_hash=pw_hash, role="student")
    dominic = User(name="Dominic Chen", email="dominic@example.com", password_hash=pw_hash, role="student")
    sarah = User(name="Sarah Connor", email="sarah@example.com", password_hash=pw_hash, role="student")
    marcus = User(name="Marcus Vance", email="marcus@example.com", password_hash=pw_hash, role="student")
    db.add_all([alex, dominic, sarah, marcus])
    db.commit()

    print("Seeding Multi-Domain Subjects...")
    cs = Subject(name="Computer Science", description="Algorithms, Machine Learning, and Programming Systems")
    math = Subject(name="Mathematics", description="Calculus, Linear Algebra, and Probability")
    english = Subject(name="English", description="Analytical Reading, Rhetoric, and Structured Composition")
    db.add_all([cs, math, english])
    db.commit()

    print("Seeding Skills and Prerequisite Graph...")
    # Computer Science Skills
    sk_py = Skill(subject_id=cs.id, name="Python Programming Basics", code="CS_PYTHON", description="Variables, control structures, and NumPy array operations", difficulty=0.3)
    sk_linreg = Skill(subject_id=cs.id, name="Linear Regression", code="CS_LINREG", description="Cost functions, hypothesis representation, and closed-form normal equations", difficulty=0.5)
    sk_graddesc = Skill(subject_id=cs.id, name="Gradient Descent", code="CS_GRADDESC", description="Learning rate tuning, partial derivative stepping, and convergence diagnostics", difficulty=0.7)
    sk_logreg = Skill(subject_id=cs.id, name="Logistic Regression", code="CS_LOGREG", description="Sigmoid activation, decision boundaries, and cross-entropy loss", difficulty=0.6)
    sk_modeval = Skill(subject_id=cs.id, name="Model Evaluation", code="CS_MODEVAL", description="Confusion matrix, precision, recall, F1-score, and ROC-AUC curves", difficulty=0.6)
    sk_regular = Skill(subject_id=cs.id, name="Regularization & Overfitting", code="CS_REGULAR", description="L1 Lasso, L2 Ridge, bias-variance tradeoff", difficulty=0.65)
    sk_nn = Skill(subject_id=cs.id, name="Neural Networks", code="CS_NEURALNET", description="Multilayer perceptrons, backpropagation, and activation functions", difficulty=0.85)
    sk_dataprep = Skill(subject_id=cs.id, name="Data Preprocessing", code="CS_DATAPREP", description="Feature scaling, imputation, and categorical encoding", difficulty=0.4)

    # Math Skills
    sk_vectors = Skill(subject_id=math.id, name="Vectors & Matrices", code="MATH_VECTORS", description="Vector spaces, dot products, and matrix operations", difficulty=0.4)
    sk_matrixmult = Skill(subject_id=math.id, name="Matrix Multiplication & Inverses", code="MATH_MATMULT", description="Matrix dimensions, properties, and inversions", difficulty=0.55)
    sk_deriv = Skill(subject_id=math.id, name="Derivatives & Chain Rule", code="MATH_DERIV", description="Instantaneous rate of change and composite function differentiation", difficulty=0.5)
    sk_partderiv = Skill(subject_id=math.id, name="Partial Derivatives", code="MATH_PARTDERIV", description="Multivariate functions and gradient vectors", difficulty=0.65)
    sk_prob = Skill(subject_id=math.id, name="Probability Fundamentals", code="MATH_PROB", description="Sample spaces, conditional probability, and independent events", difficulty=0.45)
    sk_bayes = Skill(subject_id=math.id, name="Bayes' Theorem", code="MATH_BAYES", description="Prior, likelihood, posterior updates, and conditional inference", difficulty=0.6)

    # English Skills
    sk_rhetoric = Skill(subject_id=english.id, name="Rhetorical Analysis", code="ENG_RHETORIC", description="Ethos, pathos, logos, and authorial stance", difficulty=0.5)
    sk_cohesion = Skill(subject_id=english.id, name="Paragraph Cohesion & Transitions", code="ENG_COHESION", description="Logical flow, transitions, and structural unity", difficulty=0.4)
    sk_thesis = Skill(subject_id=english.id, name="Thesis Formulation", code="ENG_THESIS", description="Arguable, focused, and defensible central claims", difficulty=0.55)
    sk_evidence_eng = Skill(subject_id=english.id, name="Evidence Integration", code="ENG_EVIDENCE", description="Quotation embedding, citation synthesis, and textual warrants", difficulty=0.6)

    db.add_all([
        sk_py, sk_linreg, sk_graddesc, sk_logreg, sk_modeval, sk_regular, sk_nn, sk_dataprep,
        sk_vectors, sk_matrixmult, sk_deriv, sk_partderiv, sk_prob, sk_bayes,
        sk_rhetoric, sk_cohesion, sk_thesis, sk_evidence_eng
    ])
    db.commit()

    # Wire Prerequisite Graph (Skill A -> Skill B means A is prerequisite for B)
    sk_linreg.prerequisites.append(sk_py)
    sk_graddesc.prerequisites.append(sk_linreg)
    sk_graddesc.prerequisites.append(sk_partderiv)
    sk_nn.prerequisites.append(sk_graddesc)
    sk_matrixmult.prerequisites.append(sk_vectors)
    sk_partderiv.prerequisites.append(sk_deriv)
    sk_bayes.prerequisites.append(sk_prob)
    sk_evidence_eng.prerequisites.append(sk_thesis)
    db.commit()

    print("Seeding Learning Resources...")
    resources = [
        # Gradient Descent Resources (Curated Pathway)
        Resource(
            skill_id=sk_graddesc.id,
            title="Intuitive Visual Guide to Gradient Descent",
            description="Visual step-by-step breakdown of cost surfaces, gradients, and learning rate step sizes.",
            resource_type="VIDEO",
            url="https://www.youtube.com/watch?v=IHZwWFHWa-w",
            difficulty=0.5,
            estimated_minutes=8,
            sequence_order=1
        ),
        Resource(
            skill_id=sk_graddesc.id,
            title="Interactive Learning Rate & Convergence Sandbox",
            description="Hands-on interactive tutorial exploring oversized learning rates, oscillation, and gradient calculation.",
            resource_type="TUTORIAL",
            url="https://distill.pub/2017/momentum/",
            difficulty=0.65,
            estimated_minutes=15,
            sequence_order=2
        ),
        Resource(
            skill_id=sk_graddesc.id,
            title="Optimization Practice Problem Set",
            description="5 targeted challenge problems on parameter updates, cost derivatives, and local minima.",
            resource_type="PRACTICE",
            url="https://khanacademy.org/math/multivariable-calculus/optimizing-multivariable-functions",
            difficulty=0.7,
            estimated_minutes=12,
            sequence_order=3
        ),
        # Model Evaluation
        Resource(
            skill_id=sk_modeval.id,
            title="Mastering Confusion Matrices, Precision & Recall",
            description="Clear real-world examples distinguishing false positives from false negatives.",
            resource_type="ARTICLE",
            url="https://developers.google.com/machine-learning/crash-course/classification/precision-and-recall",
            difficulty=0.55,
            estimated_minutes=10,
            sequence_order=1
        ),
        Resource(
            skill_id=sk_modeval.id,
            title="F1-Score and Tradeoff Practice Quiz",
            description="Interactive scenarios testing metric choice for imbalanced datasets.",
            resource_type="PRACTICE",
            url="https://scikit-learn.org/stable/modules/model_evaluation.html",
            difficulty=0.6,
            estimated_minutes=10,
            sequence_order=2
        ),
        # Partial Derivatives
        Resource(
            skill_id=sk_partderiv.id,
            title="Visualizing Multivariable Gradients",
            description="How to take derivatives with respect to one variable while holding others constant.",
            resource_type="VIDEO",
            url="https://www.3blue1brown.com/lessons/gradient",
            difficulty=0.6,
            estimated_minutes=12,
            sequence_order=1
        ),
        # Bayes Theorem
        Resource(
            skill_id=sk_bayes.id,
            title="Bayes Theorem with Real Medical Diagnostics",
            description="Understanding prior probabilities and posterior updates without confusing algebra.",
            resource_type="ARTICLE",
            url="https://betterexplained.com/articles/an-intuitive-and-gentle-explanation-of-bayes-theorem/",
            difficulty=0.55,
            estimated_minutes=9,
            sequence_order=1
        )
    ]
    db.add_all(resources)
    db.commit()

    print("Seeding Assessments & Diagnostic Items...")
    # 1. Computer Science Diagnostic
    cs_diagnostic = Assessment(
        subject_id=cs.id,
        title="Computer Science Core Diagnostic",
        type="DIAGNOSTIC",
        description="Comprehensive diagnostic to baseline knowledge in programming and machine learning fundamentals."
    )
    db.add(cs_diagnostic)
    db.commit()

    cs_items = [
        AssessmentItem(
            assessment_id=cs_diagnostic.id,
            skill_id=sk_py.id,
            question="Which Python data structure is immutable?",
            difficulty=0.3,
            correct_answer="Tuple",
            options_json=json.dumps(["List", "Tuple", "Dictionary", "Set"]),
            explanation="Tuples cannot be modified after instantiation in Python."
        ),
        AssessmentItem(
            assessment_id=cs_diagnostic.id,
            skill_id=sk_linreg.id,
            question="What is the standard loss function minimized in ordinary least squares linear regression?",
            difficulty=0.5,
            correct_answer="Mean Squared Error",
            options_json=json.dumps(["Mean Squared Error", "Cross-Entropy Loss", "Hinge Loss", "Kullback-Leibler Divergence"]),
            explanation="Ordinary least squares minimizes the sum of squared differences (MSE)."
        ),
        AssessmentItem(
            assessment_id=cs_diagnostic.id,
            skill_id=sk_graddesc.id,
            question="What happens during gradient descent if the learning rate is set too large?",
            difficulty=0.7,
            correct_answer="The algorithm may overshoot the minimum and diverge",
            options_json=json.dumps([
                "The algorithm moves too slowly and gets stuck",
                "The algorithm may overshoot the minimum and diverge",
                "The cost function automatically resets to zero",
                "Weights are pruned from the network"
            ]),
            explanation="A learning rate that is too large causes steps that overshoot the convex valley and diverge."
        ),
        AssessmentItem(
            assessment_id=cs_diagnostic.id,
            skill_id=sk_graddesc.id,
            question="In batch gradient descent, which direction do parameters update along?",
            difficulty=0.65,
            correct_answer="Opposite direction of the gradient vector",
            options_json=json.dumps([
                "Same direction as the gradient vector",
                "Opposite direction of the gradient vector",
                "Orthogonal to the gradient vector",
                "Random orthogonal permutation"
            ]),
            explanation="We move in the direction of steepest descent, which is the negative gradient (-∇J)."
        ),
        AssessmentItem(
            assessment_id=cs_diagnostic.id,
            skill_id=sk_modeval.id,
            question="In a medical cancer detection model where missing a sick patient has catastrophic consequences, which metric should be prioritized?",
            difficulty=0.6,
            correct_answer="Recall",
            options_json=json.dumps(["Accuracy", "Precision", "Recall", "Specificity"]),
            explanation="Recall minimizes False Negatives, ensuring sick patients are not missed."
        ),
        AssessmentItem(
            assessment_id=cs_diagnostic.id,
            skill_id=sk_logreg.id,
            question="What activation function maps real numbers to the (0, 1) probability interval in binary logistic regression?",
            difficulty=0.55,
            correct_answer="Sigmoid function",
            options_json=json.dumps(["ReLU", "Sigmoid function", "Tanh", "Softmax"]),
            explanation="The sigmoid function σ(z) = 1 / (1 + e^-z) maps values to [0, 1]."
        )
    ]
    db.add_all(cs_items)
    db.commit()

    # 2. Reassessment Assessment for Gradient Descent (Spec Section 21 & 32)
    reassess_asm = Assessment(
        subject_id=cs.id,
        target_skill_id=sk_graddesc.id,
        title="Gradient Descent Targeted Reassessment",
        type="REASSESSMENT",
        description="Focused 4-question reassessment to measure skill acquisition after completing learning resources."
    )
    db.add(reassess_asm)
    db.commit()

    reassess_items = [
        AssessmentItem(
            assessment_id=reassess_asm.id,
            skill_id=sk_graddesc.id,
            question="Which parameter directly governs the step size taken along the negative gradient vector?",
            difficulty=0.5,
            correct_answer="Learning rate",
            options_json=json.dumps(["Learning rate", "Batch size", "Number of epochs", "Momentum coefficient"]),
            explanation="The learning rate alpha directly multiplies the gradient vector to determine step size."
        ),
        AssessmentItem(
            assessment_id=reassess_asm.id,
            skill_id=sk_graddesc.id,
            question="If the loss value oscillates and increases continuously over training epochs, the recommended fix is:",
            difficulty=0.65,
            correct_answer="Decrease the learning rate",
            options_json=json.dumps(["Increase the learning rate", "Decrease the learning rate", "Remove feature normalization", "Switch to categorical cross-entropy"]),
            explanation="Decreasing alpha avoids overshooting the local or global minimum."
        ),
        AssessmentItem(
            assessment_id=reassess_asm.id,
            skill_id=sk_graddesc.id,
            question="What is the gradient value at a local minimum of a differentiable convex cost function?",
            difficulty=0.6,
            correct_answer="Zero vector",
            options_json=json.dumps(["Zero vector", "1.0", "Negative infinity", "Undefined"]),
            explanation="At the stationary point / minimum, the partial derivatives are all 0."
        ),
        AssessmentItem(
            assessment_id=reassess_asm.id,
            skill_id=sk_graddesc.id,
            question="How does Stochastic Gradient Descent (SGD) differ from Batch Gradient Descent?",
            difficulty=0.7,
            correct_answer="SGD computes the gradient using one sample per update instead of the entire dataset",
            options_json=json.dumps([
                "SGD computes the gradient using one sample per update instead of the entire dataset",
                "SGD does not use a learning rate",
                "SGD only works on non-linear neural networks",
                "SGD never converges"
            ]),
            explanation="SGD samples 1 instance per update step, yielding faster and noisier steps."
        )
    ]
    db.add_all(reassess_items)
    db.commit()

    # 3. Math Diagnostic
    math_diagnostic = Assessment(
        subject_id=math.id,
        title="Mathematics & Probability Diagnostic",
        type="DIAGNOSTIC",
        description="Diagnostic covering calculus, vectors, and Bayesian probability."
    )
    db.add(math_diagnostic)
    db.commit()

    math_items = [
        AssessmentItem(
            assessment_id=math_diagnostic.id,
            skill_id=sk_deriv.id,
            question="What is the derivative of f(x) = 3x^2 with respect to x?",
            difficulty=0.4,
            correct_answer="6x",
            options_json=json.dumps(["3x", "6x", "6", "x^3"]),
            explanation="Using the power rule: d/dx(3x^2) = 3 * 2x = 6x."
        ),
        AssessmentItem(
            assessment_id=math_diagnostic.id,
            skill_id=sk_partderiv.id,
            question="Given f(x, y) = x^2 * y + 4y, what is ∂f/∂x?",
            difficulty=0.6,
            correct_answer="2xy",
            options_json=json.dumps(["2xy", "x^2 + 4", "2xy + 4", "2x + y"]),
            explanation="Treat y as constant: ∂/∂x(x^2 * y) = 2xy, ∂/∂x(4y) = 0."
        ),
        AssessmentItem(
            assessment_id=math_diagnostic.id,
            skill_id=sk_bayes.id,
            question="In Bayes' theorem P(A|B) = [P(B|A) * P(A)] / P(B), what is P(A) known as?",
            difficulty=0.5,
            correct_answer="Prior probability",
            options_json=json.dumps(["Prior probability", "Likelihood", "Posterior probability", "Evidence marginal"]),
            explanation="P(A) is the prior belief before observing evidence B."
        )
    ]
    db.add_all(math_items)
    db.commit()

    # 4. English Diagnostic
    eng_diagnostic = Assessment(
        subject_id=english.id,
        title="Analytical English & Writing Diagnostic",
        type="DIAGNOSTIC",
        description="Assesses argumentative thesis construction, rhetorical awareness, and textual evidence synthesis."
    )
    db.add(eng_diagnostic)
    db.commit()

    eng_items = [
        AssessmentItem(
            assessment_id=eng_diagnostic.id,
            skill_id=sk_thesis.id,
            question="Which sentence serves as an effective, arguable academic thesis statement?",
            difficulty=0.55,
            correct_answer="Renewable subsidies promote local economic resilience while reducing carbon output.",
            options_json=json.dumps([
                "Renewable subsidies promote local economic resilience while reducing carbon output.",
                "Solar energy comes from sunlight.",
                "Pollution is bad for our planet.",
                "This paper discusses various aspects of green technologies."
            ]),
            explanation="A strong thesis takes a specific, debatable position supported by warrants."
        ),
        AssessmentItem(
            assessment_id=eng_diagnostic.id,
            skill_id=sk_rhetoric.id,
            question="Which rhetorical appeal relies primarily on empirical statistics, logical syllogisms, and verified evidence?",
            difficulty=0.45,
            correct_answer="Logos",
            options_json=json.dumps(["Logos", "Pathos", "Ethos", "Kairos"]),
            explanation="Logos targets deductive and inductive logic."
        )
    ]
    db.add_all(eng_items)
    db.commit()

    print("Seeding Alex's Heterogeneous Evidence History (Spec Section 32 Demo Student)...")
    # Alex's evidence:
    # Strong: Python Basics (88%), Linear Regression (82%)
    # Developing: Logistic Regression (61%)
    # Weak: Gradient Descent (43% mastery, 91% confidence, high priority)
    # Weak: Model Evaluation (48% mastery)

    now = datetime.utcnow()

    # Python Basics (Strong)
    db.add(Evidence(student_id=alex.id, skill_id=sk_py.id, source_type="QUIZ", raw_score=90.0, normalized_score=0.90, correctness=True, confidence=1.0, timestamp=now - timedelta(days=12)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_py.id, source_type="ASSIGNMENT", raw_score=86.0, normalized_score=0.86, correctness=True, confidence=1.0, timestamp=now - timedelta(days=8)))

    # Linear Regression (Strong)
    db.add(Evidence(student_id=alex.id, skill_id=sk_linreg.id, source_type="QUIZ", raw_score=80.0, normalized_score=0.80, correctness=True, confidence=1.0, timestamp=now - timedelta(days=10)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_linreg.id, source_type="GRADEBOOK", raw_score=84.0, normalized_score=0.84, correctness=True, confidence=1.0, timestamp=now - timedelta(days=6)))

    # Logistic Regression (Developing)
    db.add(Evidence(student_id=alex.id, skill_id=sk_logreg.id, source_type="QUIZ", raw_score=60.0, normalized_score=0.60, correctness=True, confidence=1.0, timestamp=now - timedelta(days=9)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_logreg.id, source_type="ASSIGNMENT", raw_score=62.0, normalized_score=0.62, correctness=True, confidence=1.0, timestamp=now - timedelta(days=5)))

    # Gradient Descent (Weak - SPEC EXACT MATCH: ~43% mastery, high confidence, multi-source)
    # 5 recent quiz questions and 2 assignment items where Alex struggled with step size & convergence
    db.add(Evidence(student_id=alex.id, skill_id=sk_graddesc.id, source_type="QUIZ", raw_score=40.0, normalized_score=0.40, correctness=False, confidence=1.0, timestamp=now - timedelta(days=14)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_graddesc.id, source_type="QUIZ", raw_score=40.0, normalized_score=0.40, correctness=False, confidence=1.0, timestamp=now - timedelta(days=11)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_graddesc.id, source_type="QUIZ", raw_score=50.0, normalized_score=0.50, correctness=False, confidence=1.0, timestamp=now - timedelta(days=9)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_graddesc.id, source_type="ASSIGNMENT", raw_score=42.0, normalized_score=0.42, correctness=False, confidence=1.0, timestamp=now - timedelta(days=6)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_graddesc.id, source_type="GRADEBOOK", raw_score=45.0, normalized_score=0.45, correctness=False, confidence=1.0, timestamp=now - timedelta(days=4)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_graddesc.id, source_type="SELF_REPORT", raw_score=35.0, normalized_score=0.35, correctness=False, confidence=0.8, timestamp=now - timedelta(days=3)))

    # Model Evaluation (Weak: 48%)
    db.add(Evidence(student_id=alex.id, skill_id=sk_modeval.id, source_type="QUIZ", raw_score=45.0, normalized_score=0.45, correctness=False, confidence=1.0, timestamp=now - timedelta(days=7)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_modeval.id, source_type="ASSIGNMENT", raw_score=50.0, normalized_score=0.50, correctness=False, confidence=1.0, timestamp=now - timedelta(days=3)))

    # Mathematics & English evidence for cross-domain profile
    db.add(Evidence(student_id=alex.id, skill_id=sk_deriv.id, source_type="DIAGNOSTIC", raw_score=75.0, normalized_score=0.75, correctness=True, confidence=1.0, timestamp=now - timedelta(days=15)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_bayes.id, source_type="QUIZ", raw_score=52.0, normalized_score=0.52, correctness=False, confidence=1.0, timestamp=now - timedelta(days=10)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_thesis.id, source_type="ASSIGNMENT", raw_score=85.0, normalized_score=0.85, correctness=True, confidence=1.0, timestamp=now - timedelta(days=12)))
    db.add(Evidence(student_id=alex.id, skill_id=sk_rhetoric.id, source_type="QUIZ", raw_score=78.0, normalized_score=0.78, correctness=True, confidence=1.0, timestamp=now - timedelta(days=8)))

    db.commit()

    print("Running Initial Mastery Estimation and Gap Detection for Alex...")
    update_all_student_masteries(db, alex.id)
    detect_and_rank_gaps(db, alex.id)
    refresh_student_recommendations(db, alex.id)

    db.close()
    print("Demo dataset successfully seeded!")

if __name__ == "__main__":
    seed_database()

