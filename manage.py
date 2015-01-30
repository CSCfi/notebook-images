from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand

from resource_cloud.server import app, db
from resource_cloud import models


migrate = Migrate(app, db)
manager = Manager(app)
manager.add_command('migrate', MigrateCommand)


@manager.shell
def make_context():
    return dict(app=app, db=db, models=models)


@manager.command
def test():
    """Runs the unit tests without coverage."""
    import unittest
    tests = unittest.TestLoader().discover('resource_cloud.tests')
    unittest.TextTestRunner(verbosity=2).run(tests)


@manager.command
def cov():
    """Runs the unit tests with coverage."""
    import coverage
    import unittest
    cov = coverage.coverage(
        branch=True,
        include='resource_cloud/*'
    )
    cov.start()
    tests = unittest.TestLoader().discover('resource_cloud.tests')
    unittest.TextTestRunner(verbosity=2).run(tests)
    cov.stop()
    cov.save()
    print('Coverage Summary:')
    cov.report()

if __name__ == '__main__':
        manager.run()