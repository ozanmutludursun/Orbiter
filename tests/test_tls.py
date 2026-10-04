"""Exercise host CA loading with the frozen runtime's default store empty."""
import ssl
import sys
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'defaults'))
from orbiter_core import source


class TrustStoreTests(unittest.TestCase):
    def test_system_bundle_restores_empty_frozen_trust_store(self):
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        self.assertEqual(context.cert_store_stats()['x509_ca'], 0)
        fixture = str(Path(__file__).parent / 'fixtures' / 'tls-test-ca.pem')
        with patch('ssl.create_default_context', return_value=context), patch.object(source, 'SYSTEM_CA_FILES', (fixture,)):
            result = source.tls_context()
        self.assertIs(result, context)
        self.assertEqual(result.cert_store_stats()['x509_ca'], 1)
        self.assertEqual(result.verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(result.check_hostname)

    def test_no_system_bundle_keeps_verified_platform_defaults(self):
        context = ssl.create_default_context()
        with patch('ssl.create_default_context', return_value=context), patch.object(source, 'SYSTEM_CA_FILES', ()):
            self.assertIs(source.tls_context(), context)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)
        self.assertTrue(context.check_hostname)

    def test_download_uses_explicit_verified_context(self):
        context = ssl.create_default_context()
        response = MagicMock()
        response.__enter__.return_value = response
        response.geturl.return_value = source.SOURCE
        response.read.return_value = b'official page'
        with patch.object(source, 'tls_context', return_value=context), patch('urllib.request.urlopen', return_value=response) as request:
            self.assertEqual(source.download(source.SOURCE), 'official page')
        self.assertIs(request.call_args.kwargs['context'], context)
        self.assertEqual(request.call_args.kwargs['timeout'], 12)
